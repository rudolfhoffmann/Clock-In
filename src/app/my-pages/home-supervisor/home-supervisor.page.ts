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
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';


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

  customerBranch = '';
  adminPassword = '';

  constructor(
    private signInWithApple: SignInWithApple,
    private plt: Platform,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,  // Object to handle form validation.
    private globalFunctions: GlobalFunctionsService,
  ) {
    this.formGroup = this.formBuilder.group({
      // Define validations.
      supervisorEmailCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(30), Validators.required, Validators.email,
      ])],
      supervisorPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
    });
  }

  ngOnInit() {
    this.realtimeDB = getDatabase();
    this.refAccountEmail = ref(this.realtimeDB, environment.dbAccountEmailBranch);
  }


  ionViewDidEnter() {
    // Authenticate with Android or iOS. If authentication not working, navigate back to home (root).
    if(this.plt.is('android')) {
      this.googleAuth();
    }
    else if(this.plt.is('ios')) {
      this.appleAuth();
    }
    else {
      this.navigate2Home();
    }
  }


  googleAuth() {
    GoogleAuth.signIn().then(googleUser => {
      this.checkUserEmail(googleUser.email);
    }).catch( error => {
      // Logout?
      this.navigate2Home();
    });
  }

  appleAuth() {
    this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    }).then((appleUser: AppleSignInResponse) => {
      // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
      this.checkUserEmail(appleUser.email);
    }).catch((error: AppleSignInErrorResponse) => {
      //alert(error.code + ' ' + error.localizedDescription);
      // Logout?
      this.navigate2Home();
    });
  }


  // Check, if userEmail already exist. If exist, enable login. Else register.
  async checkUserEmail(userEmail) {
    this.supervisorEmail = userEmail;
    const accountEmail = (await get(this.refAccountEmail)).val();
    const emails = Object.values(accountEmail);
    const emailAvail = emails.includes(this.supervisorEmail);

    if(emailAvail) {
      // Get the corresponding account of this email, in order to get the adminPassword to check credentialMatch.
      this.customerBranch = this.globalFunctions.getKeyByValue(accountEmail, this.supervisorEmail);
      const refCustomerBranchConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);
      const configData = (await get(refCustomerBranchConfig)).val();
      this.adminPassword = configData.adminPassword;

      this.formGroup.patchValue({
        supervisorEmailCtrl: this.supervisorEmail,
      });
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

        this.formGroup.setValue({
          supervisorEmailCtrl: this.supervisorEmail,
          supervisorPasswordCtrl: this.supervisorPassword,
        });

        this.login2Supervisor();
      }
    });
  }




  // Read password for the customer branch from realtime database.
  // If password from realtime database matches the password from local storage, navigate to clockinui.
  checkCredentialMatch() {
    alert(this.adminPassword);
    if(this.supervisorPassword === this.adminPassword) {
      // Redirect to admin UI.
      this.navigate2Adminui();
    } else {
      alert('Supervisor-Email und Passwort stimmen nicht überein!');
    }
  }


  login2Supervisor() {
    this.supervisorEmail = this.formGroup.get('supervisorEmailCtrl').value;
    this.supervisorPassword = this.formGroup.get('supervisorPasswordCtrl').value;

    this.checkCredentialMatch();
  }


  navigate2Home() {
    this.navCtrl.navigateRoot('/home');
  }
  navigate2Adminui() {
    this.navCtrl.navigateRoot('/adminui');
  }
}
