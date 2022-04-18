/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';

import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NavController, PopoverController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';

import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';


import { environment } from 'src/environments/environment';
import { SimpleInputComponent } from 'src/app/my-components/simple-input/simple-input.component';


@Component({
  selector: 'app-qrgenerator',
  templateUrl: './qrgenerator.page.html',
  styleUrls: ['./qrgenerator.page.scss'],
})
export class QrgeneratorPage implements OnInit {
  // ----- Static Variables -----
  TOAST_LENGTH: number = 3000;


  // ----- Member Variables -----
  hasWriteAccess = false;
  hasReadAccess = false;


  content: string;
  contentAvail: boolean;
  // Not used since version 0.1.1
  address: string;
  addressAvail: boolean;
  customer: string;
  customerAvail: boolean;
  // Not used since version 0.1.1

  elementType = NgxQrcodeElementTypes.CANVAS;
  generatedCode = '';


  constructor(
    private androidPermissions: AndroidPermissions,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private file: File,
    private fileOpener: FileOpener,
    private plt: Platform,
    private globalFunctions: GlobalFunctionsService,
  ) { }

  ngOnInit() {
    //this.checkPermissions();
  }



  checkPermissions() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(res => {
      console.log('Has write permission?', res.hasPermission);
      this.hasWriteAccess = res.hasPermission;

      if(!this.hasWriteAccess) {
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
      }

    }).catch(err => {
       this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
    });


    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(res => {
      console.log('Has read permission?', res.hasPermission);
      this.hasReadAccess = res.hasPermission;

      if(!this.hasReadAccess) {
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE]);
      }

    }).catch(err => {
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
    });

 }



  async createInputPopover() {
    const timestamp = this.globalFunctions.createDateTimestamp();
    const predefinedFilename = 'QR_' + timestamp;

    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      this.downloadQRCode(data.filename);
    };

    // Create and pass popover to global function, in which it is further processed.
    const popover = this.popoverCtrl.create({
      component: SimpleInputComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        filename: predefinedFilename,
        header: 'QR-Code herunterladen',
        message: 'Geben Sie einen Namen an, unter dem der QR-Code gespeichert werden soll.',
        exportRecords: false,
      }
    });

    this.globalFunctions.createInputPopover(popover, onDismissFct);
  }

  downloadQRCode(filename) {
    const fileType = 'image/png';
    if (!this.hasWriteAccess || !this.hasReadAccess) {
      //this.checkPermissions();
    }
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const imageData = canvas.toDataURL(fileType).toString();

    // Download this.imageData (see Tutorial https://www.youtube.com/watch?v=iDYJ8YfdUTU -> 13. min)
    const blob = this.dataURLtoBlob(imageData);
    const fileName = filename + '.png';
    const subPath = '/Download/';
    const successFct = (path) => {
      this.globalFunctions.showToast('QR-Code wurde gespeichert unter Downloads.', this.TOAST_LENGTH);
      this.fileOpener.open(path + fileName, fileType);
      this.navCtrl.pop();
    };

    this.globalFunctions.writeFileToDevice(subPath, fileName, fileType, blob, successFct);



  }


  dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n: number = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type:mime});
  }


  generateQRCode() {
    /* Version 0.0.1
    this.generatedCode = environment.qrAuth + ':::' + this.customer + ':::' + this.address;
    */
   /* Version 0.1.1 */
   this.generatedCode = environment.qrAuth + ':::' + this.content;
  }


  // If value for customer available, then set customerAvail to true.
  setContentAvail() {
    if(this.content===null || this.content==='') {
      this.contentAvail = false;
    } else {
      this.contentAvail = true;
    }
  }


  async infoPopover(ev) {
    const information = 'Geben Sie die Information an, die der QR-Code enthalten soll.';
    this.globalFunctions.informationPopover(information, ev);
  }



  /* Not used since version 0.1.1 */
  // If value for customer available, then set customerAvail to true.
  setCustomerAvail() {
    if(this.customer===null || this.customer==='') {
      this.customerAvail = false;
    } else {
      this.customerAvail = true;
    }
  }
  // If value for address available, then set addressAvail to true.
  setAddressAvail() {
    if(this.address===null || this.address==='') {
      this.addressAvail = false;
    } else {
      this.addressAvail = true;
    }
  }
  /* Not used since version 0.1.1 */

}
