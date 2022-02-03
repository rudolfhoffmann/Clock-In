import { Component, OnInit } from '@angular/core';

import { ModalController, NavController, Platform } from '@ionic/angular';

import { ref, getDatabase, set, get, update } from '@firebase/database';

import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { SignInWithApple, ASAuthorizationAppleIDRequest }from '@ionic-native/sign-in-with-apple/ngx';
import { AppleSignInErrorResponse, AppleSignInResponse }from '@ionic-native/sign-in-with-apple/ngx';
import { ModalRegistrationPage } from '../modal-registration/modal-registration.page';


@Component({
  selector: 'app-home-supervisor',
  templateUrl: './home-supervisor.page.html',
  styleUrls: ['./home-supervisor.page.scss'],
})
export class HomeSupervisorPage implements OnInit {
  // ----- Member-Variables -----
  realtimeDB;
  dbRef: any;  // Reference to database.

  supervisorEmail = '';
  supervisorPassword = '';

  constructor(
    private signInWithApple: SignInWithApple,
    private plt: Platform,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.realtimeDB = getDatabase();
    this.dbRef = ref(this.realtimeDB);
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


  // Check, if userEmail already exist.
  checkUserEmail(userEmail) {
    this.supervisorEmail = userEmail;

    this.createRegistrationModal();
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
      }
    });
  }




  googleAuth() {
    GoogleAuth.signIn().then(googleUser => {
      this.checkUserEmail(googleUser.email);
    }).catch(error => {
      alert(JSON.stringify(error));
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
      alert(error.code + ' ' + error.localizedDescription);
      // Logout?
      this.navigate2Home();
    });
  }


  navigate2Home() {
    this.navCtrl.navigateRoot('/home');
  }

}
