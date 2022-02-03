import { Component, Input, OnInit } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { get, getDatabase, ref } from 'firebase/database';
import { InAppPurchasesService } from 'src/app/my-services/in-app-purchases.service';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-modal-info',
  templateUrl: './modal-info.page.html',
  styleUrls: ['./modal-info.page.scss'],
})
export class ModalInfoPage implements OnInit {
  @Input() title;
  @Input() id;

  appName = '';
  appVer = '';

  realtimeDB;
  dbRefConfig: any;  // Reference to config node of database.
  customerBranch: string;

  aboConfig: any;

  unlimited = false;

  constructor(
    private modalCtrl: ModalController,
    private plt: Platform,
    private appVersion: AppVersion,
    private storageService: LocalStorageService,
    private iapService: InAppPurchasesService,
  ) {
  }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    this.plt.ready().then(() => {
      this.readAppInfo();
    });

    // Read account credentials from local storage.
    this.customerBranch = await this.storageService.get('customerBranch');
    this.realtimeDB = getDatabase();
    this.dbRefConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);
    get(this.dbRefConfig).then((snapshot) => {
      this.aboConfig = snapshot.val();

      if(this.aboConfig.dataHistory === this.iapService.UNLIMITED_HISTORY) {
        this.unlimited = true;
      }
    });
  }

  async readAppInfo() {
    this.appName = await this.appVersion.getAppName();
    this.appVer = await this.appVersion.getVersionNumber();
  }


  closeModal(data) {
    this.modalCtrl.dismiss(data);
  }

}
