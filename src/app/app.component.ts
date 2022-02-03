// USE NVM VERSION 14.15

/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';

import { PopoverController, MenuController, NavController, Platform, ModalController } from'@ionic/angular';

import { initializeApp } from '@firebase/app';
import { ref, getDatabase, set, get } from '@firebase/database';
import { getAuth, signInWithEmailAndPassword, initializeAuth, indexedDBLocalPersistence } from '@firebase/auth';
import { environment } from 'src/environments/environment';


import { LocalStorageService } from './my-services/local-storage.service';

import { NavigationExtras } from '@angular/router';
import { ModalConsentPage } from './my-pages/modal-consent/modal-consent.page';
import { Device } from '@capacitor/device';


import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { SignInWithApple, ASAuthorizationAppleIDRequest }from '@ionic-native/sign-in-with-apple/ngx';
import { AppleSignInErrorResponse, AppleSignInResponse }from '@ionic-native/sign-in-with-apple/ngx';






@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // ----- Static Variables -----
  SIDE_MENU_ID = {
    INFO: 2,
    IMPRESSUM: 3,
    CONTACT: 4,
    LOGOUT: 5,
  };

  // ----- Member Variables -----
  // Login as admin.
  navigate: any;

  uuid: string;
  login = false;

  realtimeDB;
  dbRefAdminPass;  // Reference to admin password

  customerBranch: string;

  constructor(
    private popoverCtrl: PopoverController,
    private plt: Platform,
    private menu: MenuController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private storageService: LocalStorageService,
    private signInWithApple: SignInWithApple
  ) {
    Device.getId().then(devideId => {
      this.uuid = devideId.uuid;
    });

    this.sideMenu();
    // Authenticate user with email and password.
    // For this, enable authentication with email in firebase console:
    // Once you’re inside the app’s dashboard, you’re going to go into Authentication > Sign-In Method >
    // Email and are going to click the Enable toggle.
    // Furthermore, add the user in Authentication > Users > Add user.
    //const auth = getAuth();
    // Use initializeAuth with indexedDBLocalPersistence as persistence type. Otherwise, it does not work on iOS.
    const app = initializeApp(environment.firebaseConfig);
    const auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
    signInWithEmailAndPassword(auth, environment.email, environment.emailpass).then((res) => {
      //alert(JSON.stringify(res));
    }).catch((e) => {
      alert(JSON.stringify(e));
    });
    // First initializing necessary before creating database object.
    this.realtimeDB = getDatabase();


    this.createConsentModal();

    if(this.plt.is('android')) {
      GoogleAuth.signIn().then(googleUser => {
        alert(googleUser.email);
      }).catch(e => {
        alert(JSON.stringify(e));
        // Back
      });
    }
    else if(this.plt.is('ios')) {
      this.signInWithApple.signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      }).then((appleUser: AppleSignInResponse) => {
        // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
        alert(appleUser.email);
      }).catch((error: AppleSignInErrorResponse) => {
        alert(error.code + ' ' + error.localizedDescription);
      });
    }

  }
  // Constructor end


  // If privacy and terms not consented, create consent modal.
  async createConsentModal() {
    const consented: boolean = await this.storageService.get('consented');
    if(!consented) {
      const modal = await this.modalCtrl.create({
        component: ModalConsentPage,
        cssClass: 'modalFullscreenCss',
        showBackdrop: false,
      });

      // Show popover.
      await modal.present();

      // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
      await modal.onWillDismiss().then(res => {

      });
    }
  }


  navigateTo(pageurl, id) {
    // Pass data to another page.
    const navigationExtra: NavigationExtras = {
      queryParams: {
        uuid: this.uuid,
      }
    };

    if(id === this.SIDE_MENU_ID.LOGOUT) {
      // On logout, clear all data in storage. Just remember consent property.
      this.storageService.logout(pageurl, navigationExtra);
    }
    else {
      this.navCtrl.navigateForward(pageurl, navigationExtra);
    }

    this.menu.close();
  }


  sideMenu() {
    this.navigate = [

      {
        // contains "privacy", "use conditions", "app version", "aboConfig infos", "permissions"
        title : 'Info',
        url   : '/info',
        icon  : 'information-circle-outline',
        id: this.SIDE_MENU_ID.IMPRESSUM,
      },
      {
        title : 'Impressum',
        url   : '/imprint',
        icon  : '',
        id: this.SIDE_MENU_ID.IMPRESSUM,
      },
      /*{
        title : 'Kontakt',
        url   : '/contact',  // contains contact form
        icon  : 'mail-outline',
        id: this.SIDE_MENU_ID.CONTACT,
      },*/
      {
        title : 'Abmelden',
        url   : '/home',
        icon  : 'log-out-outline',
        id: this.SIDE_MENU_ID.LOGOUT,
      },
    ];
  }


  async clearCredentials() {
    await this.storageService.clear();
  }

}
