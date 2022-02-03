import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';

@Component({
  selector: 'app-modal-consent',
  templateUrl: './modal-consent.page.html',
  styleUrls: ['./modal-consent.page.scss'],
})
export class ModalConsentPage implements OnInit {
  // ----- Member Variables -----
  consented = false;

  constructor(
    private globalFunctions: GlobalFunctionsService,
    private storageService: LocalStorageService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }


  createInfoModal(infoId, infoTitle) {
    this.globalFunctions.createInfoModal(infoId, infoTitle);
  }


  async submitConsent() {
    await this.storageService.set('consented', this.consented);
    this.modalCtrl.dismiss();
  }

}
