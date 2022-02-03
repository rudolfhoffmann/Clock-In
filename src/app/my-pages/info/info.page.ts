import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { ModalInfoPage } from '../modal-info/modal-info.page';


@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private globalFunctions: GlobalFunctionsService,
  ) { }

  ngOnInit() {
  }



  createInfoModal(infoId, infoTitle) {
    this.globalFunctions.createInfoModal(infoId, infoTitle);
  }

}
