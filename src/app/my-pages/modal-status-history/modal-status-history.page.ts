import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

@Component({
  selector: 'app-modal-status-history',
  templateUrl: './modal-status-history.page.html',
  styleUrls: ['./modal-status-history.page.scss'],
})
export class ModalStatusHistoryPage implements OnInit {
  // ---- Member Variables -----
  @Input() user;
  @Input() checkins;

  /* Version 0.0.1 */
  /*
  historyVisual: {checkin: string; date: string; time: string; employees: string;
    customer: string; address: string; comments: string;}[] = [];
  */
  /* Version 0.0.1 */
  /* Version 0.1.1 */
  historyVisual: {
    checkin: string;
    date: string;
    time: string;
    comments: string;
    content: string;
  }[] = [];
  /* Version 0.0.1 */

  objKeys = [];

  noCapture = true;

  constructor(
    private globalFunctions: GlobalFunctionsService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.objKeys = Object.keys(this.checkins);
    this.objKeys.reverse();  // Reverse list, in order to sort the content from new to old.

    if(this.objKeys.length > 0) {
      this.noCapture = false;
    };

    this.objKeys.forEach(key => {
      const status = this.checkins[key];

      // Determine checkin.
      const checkinVis: string = this.globalFunctions.getCheckinVis(status.checkin);


      // Determine date and time.
      const date = new Date(status.timestamp);
      let timestampString = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ';
      timestampString += date.getHours() + ':' + date.getMinutes();
      const dateVis: string = this.globalFunctions.getDateVis(timestampString);
      const timeVis: string = this.globalFunctions.getTimeVis(timestampString);


      // Determine employees.
      /* Not used since version 0.1.1
      const employeesVis: string = this.globalFunctions.getEmployeeVis(status.employees);
      // Determine customer and address from qrcode.
      const customerVis = status.customer;
      const addressVis = status.address;
      */
      const contentVis = status.content;

      const commentsVis = status.comments;



      /* Version 0.0.1
      this.historyVisual.push({checkin: checkinVis, date: dateVis, time: timeVis, employees: employeesVis,
        customer: customerVis, address: addressVis, comments: commentsVis});
      */
     /* Version 0.1.1 */
     this.historyVisual.push({checkin: checkinVis, date: dateVis, time: timeVis, comments: commentsVis, content: contentVis});
    });
  }


  closeModal() {
    this.modalCtrl.dismiss();
  }

}
