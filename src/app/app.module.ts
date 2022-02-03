// Google Sign In: https://devdactic.com/capacitor-google-sign-in/

// Apple Sign In using @ionic-native/sign-in-with-apple.
// Important!!! Go to: App --> Target --> Signing & Capabilities --> Add new capability --> Sign in with Apple

// Firebase
// Installation: npm install firebase @angular/fire
//import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
//import { provideDatabase, getDatabase } from '@angular/fire/database';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { Storage } from '@ionic/storage-angular';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SignInWithApple }from '@ionic-native/sign-in-with-apple/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { File } from '@ionic-native/file/ngx';

import { InformationComponent } from './my-components/information/information.component';
import { BlockingComponent } from './my-components/blocking/blocking.component';
import { UsernameComponent } from './my-components/username/username.component';
import { IntroSliderComponent } from './my-components/intro-slider/intro-slider.component';
import { SubscriptionComponent } from './my-components/subscription/subscription.component';
import { SimpleInputComponent } from './my-components/simple-input/simple-input.component';
import { ActionMenuAdminComponent } from './my-components/action-menu-admin/action-menu-admin.component';




@NgModule({
  declarations: [AppComponent, BlockingComponent, InformationComponent, UsernameComponent, IntroSliderComponent,
    SubscriptionComponent, SimpleInputComponent, ActionMenuAdminComponent ],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, ReactiveFormsModule, ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  QRScanner, Storage, AppVersion, SignInWithApple, InAppPurchase2, File ],
  bootstrap: [AppComponent],
})
export class AppModule {}
