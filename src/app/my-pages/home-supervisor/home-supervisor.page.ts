import { Component, OnInit } from '@angular/core';

import { ModalController, NavController, Platform } from '@ionic/angular';

import { ref, getDatabase, set, get, update } from '@firebase/database';

import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { SignInWithApple, ASAuthorizationAppleIDRequest }from '@ionic-native/sign-in-with-apple/ngx';
import { AppleSignInErrorResponse, AppleSignInResponse }from '@ionic-native/sign-in-with-apple/ngx';
import { ModalRegistrationPage } from '../modal-registration/modal-registration.page';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';
import { Http, HttpResponse } from '@capacitor-community/http';


@Component({
  selector: 'app-home-supervisor',
  templateUrl: './home-supervisor.page.html',
  styleUrls: ['./home-supervisor.page.scss'],
})
export class HomeSupervisorPage implements OnInit {
  // ----- Member-Variables -----
  formGroup: FormGroup;

  realtimeDB;
  refAccountEmail: any;  // Reference to database.

  supervisorEmail = '';
  supervisorPassword = '';
  isAuth = false;

  customerBranch = '';
  branchPassword = '';
  adminPassword = '';

  loading = false;

  valError: any;


  constructor(
    private signInWithApple: SignInWithApple,
    private plt: Platform,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,  // Object to handle form validation.
    private globalFunctions: GlobalFunctionsService,
    private storageService: LocalStorageService,
  ) {
    this.valError = this.globalFunctions.VAL_ERROR;
  }

  ngOnInit() {
    this.realtimeDB = getDatabase();
    this.refAccountEmail = ref(this.realtimeDB, environment.dbAccountEmailBranch);
  }


  async ionViewDidEnter() {
    this.supervisorEmail = await this.storageService.get('supervisorEmail');
    this.isAuth = await this.storageService.get('isAuth');


    // If isAuth not stored in local storage, authentication process is necessary.
    if(this.isAuth === false || this.isAuth === null || this.isAuth === undefined) {
      // Authenticate with Android or iOS. If authentication not working, navigate back to home (root).
      if(this.plt.is('android')) {
        this.googleAuth();
      }
      else if(this.plt.is('ios')) {
        this.appleAuth();
      }
      else {
        alert('Nicht Android und nicht iOS');
        this.navigate2Home();
      }
    }
    // If supervisorEmail stored in local storage, don't authenticate and fetch corresponding password to automatically log in.
    else {
      this.checkUserEmail(this.supervisorEmail);
    }
  }


  googleAuth() {
    GoogleAuth.signIn().then(googleUser => {
      this.checkUserEmail(googleUser.email);
    }).catch( error => {
      const alertInfo2: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: JSON.stringify(error),
      };
      const arrowFct = () => { this.navigate2Home(); };
      this.globalFunctions.createInfoAlert(alertInfo2, arrowFct);
    });
  }

  appleAuth() {
    this.signInWithApple.signin({
      requestedScopes: [
        //ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    }).then((appleUser: AppleSignInResponse) => {
      // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user

      if(appleUser.email !== '') {
        this.checkUserEmail(appleUser.email);
      }
      // If app already used Apple Sign In, then the email is empty.
      // Workaround: Go to Settings --> Your Profile --> Password & Security --> Apps using Apple-ID --> Clock In --> Remove it
      else {
        const alertInfo: AlertInfo = {
          header: 'Apple-ID konnte nicht abgerufen werden',
          subHeader: '',
          message: 'Um dieses Problem zu beheben gehen Sie zu den Einstellungen Ihres Systems und navigieren Sie zu: \
                    Apple-ID > Passwort & Sicherheit > Apps, die Apple-ID verwenden > Clock In. \
                    Führen Sie die Aktion "Apple-ID nicht mehr verwenden aus" und gehen Sie erneut zu Clock-In Supervisor. ',
        };
        const arrowFunction = () => {
          this.navigate2Home();
        };
        this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
      }
    }).catch((error: AppleSignInErrorResponse) => {
      const alertInfo2: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: error.code + ' ' + error.localizedDescription,
      };
      const arrowFct = () => { this.navigate2Home(); };
      this.globalFunctions.createInfoAlert(alertInfo2, arrowFct);
    });
  }


  // Check, if userEmail already exist. If exist, enable login. Else register.
  async checkUserEmail(userEmail) {
    this.supervisorEmail = userEmail;
    const accountEmail = await get(this.refAccountEmail);
    let accountEmailVals = {};
    if(accountEmail.exists()) {
      accountEmailVals = accountEmail.val();
    }
    const emails = Object.values(accountEmailVals);
    const emailAvail = emails.includes(this.supervisorEmail);

    if(emailAvail) {
      // Get the corresponding account of this email, in order to get the adminPassword to check credentialMatch.
      this.customerBranch = this.globalFunctions.getKeyByValue(accountEmailVals, this.supervisorEmail);
      const refCustomerBranchConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);
      const configData = (await get(refCustomerBranchConfig)).val();
      this.adminPassword = configData.adminPassword;
      this.branchPassword = configData.branchPassword;

      alert(this.adminPassword + this.branchPassword);

      // Fetch adminPassword from DB and log in.
      this.supervisorPassword = this.adminPassword;
      this.checkCredentialMatch();  // Login.

    }
    else {
      this.createRegistrationModal();
    }
  }

  async createRegistrationModal() {
    const modal = await this.modalCtrl.create({
      component: ModalRegistrationPage,
      cssClass: 'modalFullscreenCss',
      showBackdrop: false,
      componentProps: {
        email: this.supervisorEmail,
      },
    });

    // Show modal.
    await modal.present();
    // Get data passed during modal dismiss.
    await modal.onDidDismiss().then(res => {
      if(res.data.registerSuccess) {
        // If successfully registered, get account credentials for supervisor and login with them.
        this.supervisorPassword = res.data.supervisorPassword;
        this.adminPassword = this.supervisorPassword;
        this.supervisorEmail = res.data.supervisorEmail;
        this.customerBranch = res.data.customerBranch;

        this.login2Supervisor();
      }
    });
  }




  // Read password for the customer branch from realtime database.
  // If password from realtime database matches the password from local storage, navigate to clockinui.
  async checkCredentialMatch() {
    if(this.supervisorPassword === this.adminPassword) {
      // Save account credentials, except of supervisor password (this one is secret).
      await this.storageService.set('customerBranch', this.customerBranch);
      await this.storageService.set('branchPassword', this.branchPassword);
      await this.storageService.set('supervisorEmail', this.supervisorEmail);
      await this.storageService.set('isAuth', true);

      // Redirect to admin UI.
      this.navigate2Adminui();
    }
    // If credentialMatch fails, clear local storage by performing logout function.
    else {
      const alertInfo: AlertInfo = {
        header: 'Authentifizierung fehlgeschlagen',
        subHeader: '',
        message: 'Supervisor-Email und Passwort stimmen nicht überein!',
      };
      const arrowFunction = () => {

      };
      this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
    }
  }


  login2Supervisor() {
    // If password for store test account, then use credentials for store test account..
    if(this.branchPassword === this.globalFunctions.STORE_TEST_ACCOUNT.BRANCH_PW) {
      this.supervisorEmail = this.globalFunctions.STORE_TEST_ACCOUNT.EMAIL;
      this.customerBranch = this.globalFunctions.STORE_TEST_ACCOUNT.BRANCH;
      this.branchPassword = this.globalFunctions.STORE_TEST_ACCOUNT.BRANCH_PW;
      this.supervisorPassword = this.globalFunctions.STORE_TEST_ACCOUNT.SUP_PW;
    }


    this.checkCredentialMatch();
  }


  navigate2Home() {
    this.navCtrl.navigateRoot('/home');
  }
  navigate2Adminui() {
    this.navCtrl.navigateRoot('/adminui');
  }

}
