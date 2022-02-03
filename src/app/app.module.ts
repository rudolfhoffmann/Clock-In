// Google Sign In: https://devdactic.com/capacitor-google-sign-in/

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

import { InformationComponent } from './my-components/information/information.component';
import { BlockingComponent } from './my-components/blocking/blocking.component';
import { UsernameComponent } from './my-components/username/username.component';
import { IntroSliderComponent } from './my-components/intro-slider/intro-slider.component';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { Storage } from '@ionic/storage-angular';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';



@NgModule({
  declarations: [AppComponent, BlockingComponent, InformationComponent, UsernameComponent, IntroSliderComponent, ],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, ReactiveFormsModule, ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  QRScanner, Storage, AppVersion ],
  bootstrap: [AppComponent],
})
export class AppModule {}
