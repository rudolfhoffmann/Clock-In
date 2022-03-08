/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PopoverController } from'@ionic/angular';

import { ref, getDatabase, get } from '@firebase/database';

import { LocalStorageService } from '../../my-services/local-storage.service';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

import { IntroSliderComponent } from 'src/app/my-components/intro-slider/intro-slider.component';

import { Device } from '@capacitor/device';
import { environment } from 'src/environments/environment';
import { InAppPurchasesService } from 'src/app/my-services/in-app-purchases.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  // ----- Member Variables -----
  uuid: string;

  realtimeDB;
  refStoreTestConfig: any;  // Reference to StoreTestAccount.
  storeAccountBranchName: string;
  storeAccountBranchPW: string;

  constructor(
    private storageService: LocalStorageService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private globalFunctions: GlobalFunctionsService,
    private iapService: InAppPurchasesService,
  ) {}

  async ngOnInit() {
    this.iapService.registerProducts();
    this.iapService.setupListeners();
    this.iapService.restore();

    this.storeAccountBranchName = this.globalFunctions.STORE_TEST_ACCOUNT.BRANCH;

    this.realtimeDB = getDatabase();
    this.refStoreTestConfig = ref(this.realtimeDB, this.storeAccountBranchName + '/' + environment.dbConfigBranch + '/');

    const storeTestConfig = await get(this.refStoreTestConfig);
    this.storeAccountBranchPW = storeTestConfig[environment.dbBranchPassword];
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


  auth4TestAccount() {
    // Pass data to another page.
    const navigationExtra: NavigationExtras = {
      queryParams: {
        testAccount: true,
      }
    };

    this.navCtrl.navigateForward('/home-scanner', navigationExtra);
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
