/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PopoverController } from'@ionic/angular';

import { LocalStorageService } from '../../my-services/local-storage.service';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

import { IntroSliderComponent } from 'src/app/my-components/intro-slider/intro-slider.component';

import { Device } from '@capacitor/device';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  // ----- Member Variables -----
  uuid: string;


  constructor(
    private storageService: LocalStorageService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private globalFunctions: GlobalFunctionsService,
  ) {}

  ngOnInit() {
  }


  async ionViewDidEnter() {
    this.uuid = (await Device.getId()).uuid;
  }



  // homepage: scanner or supervisor
  openHome(homepage: string) {
    this.navCtrl.navigateForward(`/home-${homepage}`);
  }


  async createIntroSliderPopover() {
    const popover = await this.popoverCtrl.create({
      component: IntroSliderComponent,
      cssClass: 'introSliderCss',
      backdropDismiss: false,
      translucent: true,
    });

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {

    });
  }


  navigateTo(pageurl) {
    // Pass data to another page.
    const navigationExtra: NavigationExtras = {
      queryParams: {
        uuid: this.uuid,
      }
    };

    this.navCtrl.navigateForward(pageurl, navigationExtra);
  }


  createInfoModal(infoId, infoTitle) {
    this.globalFunctions.createInfoModal(infoId, infoTitle);
  }

}
