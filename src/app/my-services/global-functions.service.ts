/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@angular/core';

import { AlertController, Platform, PopoverController, ToastController, ModalController } from '@ionic/angular';
import { InformationComponent } from '../my-components/information/information.component';
import { SimpleInputComponent } from '../my-components/simple-input/simple-input.component';
import { ModalInfoPage } from '../my-pages/modal-info/modal-info.page';
import { File } from '@ionic-native/file/ngx';


export interface AlertInfo {
  header: string;
  subHeader: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalFunctionsService {
  // Global Variables
  HEADING_USERNAME = 'Benutzername';
  HEADING_EMAIL = 'Administrator E-Mail';
  HEADING_ACCOUNTNAME = 'Kontoname';
  HEADING_ACCOUNTPASSWORD = 'Konto Passwort';
  MESSAGE_USERNAME = 'Geben Sie einen Benutzernamen an, um Ihre Scans diesem zuzuweisen.';
  MESSAGE_EMAIL = 'Geben Sie die neue E-Mail an.';
  MESSAGE_ACCOUNTNAME = 'Achtung! Beim Ändern des Kontonamen, müssen sich die Benutzer dieses Kontos mit den neuen Kontozugangsdaten erneut authentifizieren';
  MESSAGE_ACCOUNTPASSWORD = 'Achtung! Beim Ändern des Konto Passworts, müssen sich die Benutzer dieses Kontos mit den neuen Kontozugangsdaten erneut authentifizieren';
  TYPE_USERNAME = {
    username: 0,
    email: 1,
    accountname: 2,
    accountpassword: 3,
  };


  VAL_ERROR = {
    REQUIRED: 'Eingabe erforderlich!',
    MAX_L: 'Maximale Anzahl an Zeichen überschritten!',
    MIN_L: 'Minimale Anzahl an Zeichen unterschritten!',
    ZIPCODE: '5 Ziffern erforderlich!',
    PATTERN: 'Die Eingabe enthält ungültige Zeichen!',
    EMAIL: 'E-Mail Format erforderlich: username@domainname',
  };



  STORE_TEST_ACCOUNT = {
    EMAIL: 'test@inno-apps.de',
    //SUP_PW: 'TestAccount4Store',
    SUP_PW: '',
    BRANCH: 'StoreTestAccount',
    BRANCH_PW: 'StoreTestPW',
  };

  MY_SERVER_URL = 'https://inno-apps.ddns.net/ClockIn/sendmail.php';


  constructor(
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private plt: Platform,
    private file: File,
  ) { }


  getCheckinVis(checkin) {
    let checkinVis: string;
    if(checkin===true) {
      checkinVis = 'Clock-In';
    } else {
      checkinVis = 'Clock-Out';
    }

    return checkinVis;
  }

  getDateVis(timestamp) {
    const timestampSplit = timestamp.split(' ');
    const dateSplit = timestampSplit[0].split('/');
    const dateVis: string = dateSplit[2] + '.' + dateSplit[1] + '.' + dateSplit[0];

    return dateVis;
  }

  getTimeVis(timestamp) {
    const timestampSplit = timestamp.split(' ');
    const timeSplit = timestampSplit[1].split(':');
    const timeVis: string = this.pad(timeSplit[0] as number) + ':' + this.pad(timeSplit[1] as number);

    return timeVis;
  }


  visualizeTimestamps(timestampList) {
    const timestamps = [];
    timestampList.forEach(timestamp => {
      const date = new Date(timestamp);
      let timestampString = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ';
      timestampString += date.getHours() + ':' + date.getMinutes();
      const dateVis: string = this.getDateVis(timestampString);
      const timeVis: string = this.getTimeVis(timestampString);

      timestamps.push(dateVis + ' ' + timeVis + ' Uhr');
    });

    return timestamps;
  }


  getDateDiffInDays(timestamp) {
    const today = new Date();
    const date = new Date(timestamp.split(' ')[0]);

    let days = (today.getTime() - date.getTime()) / (1000*3600*24);
    days = Math.floor(days);

    return days;
  }


  getEmployeeVis(employees) {
    let employeesVis: string = '';
    employees.forEach((emp, index) => {
      if(index===0) {
        employeesVis += emp;
      } else {
        employeesVis += ', ' + emp;
      }
    });

    return employeesVis;
  }



  getQRId(qrcode: string) {
    return this.getCustomerFromQRCode(qrcode) + this.getAddressFromQRCode(qrcode);
  }


  getAuthFromQRCode(qrcode: string) {
    const qrSplit: string[] = qrcode.split(':::');

    return qrSplit[0];
  }


  // Used since version 0.1.1.
  getContentFromQRCode(qrcode: string) {
    const qrSplit: string[] = qrcode.split(':::');

    return qrSplit[1];
  }
  /* Not used since version 0.1.1 */
  getCustomerFromQRCode(qrcode: string) {
    const qrSplit: string[] = qrcode.split(':::');

    return qrSplit[1];
  }
  getAddressFromQRCode(qrcode: string) {
    const qrSplit: string[] = qrcode.split(':::');

    return qrSplit[2];
  }
  /* Not used since version 0.1.1 */


  convertLinebreak(text: string) {
    return text.replace('\n', '<br>');
  }



  pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
  }


  createSimpleAlert(alertInfo: AlertInfo, arrowFunction) {
    this.alertCtrl.create({
      header: alertInfo.header,
      subHeader: alertInfo.subHeader,
      message: alertInfo.message,
      buttons: [
        {
          // If confirmed, execute arrow function (in other languages also called lambda function).
          text: 'Ja',
          handler: () => {
            arrowFunction();
          }
        },
        {
          // Otherwise, do nothing.
          text: 'Nein',
        }
      ]
    }).then(res => {
      res.present();
    });
  }


  createInfoAlert(alertInfo: AlertInfo, arrowFunction) {
    this.alertCtrl.create({
      header: alertInfo.header,
      subHeader: alertInfo.subHeader,
      message: alertInfo.message,
      buttons: [
        {
          // If confirmed, execute arrow function (in other languages also called lambda function).
          text: 'Verstanden',
          handler: () => {
            arrowFunction();
          }
        },
      ]
    }).then(res => {
      res.present();
    });
  }


  createInputDialog(alertInfo: AlertInfo, inputList, arrowFunction) {
    this.alertCtrl.create({
      header: alertInfo.header,
      subHeader: alertInfo.subHeader,
      message: alertInfo.message,

      inputs: inputList,

      buttons: [
        {
          // Do nothing.
          text: 'Abbrechen',
        },
        {
          // If confirmed, execute arrow function (in other languages also called lambda function).
          text: 'Speichern',
          handler: (data) => {
            // Pass data to arrow function.
            arrowFunction(data);
          }
        },
      ]
    }).then(res => {
      res.present();
    });
  }


  // Create popover, in which QR-Code is named.
  async createInputPopover(pop, onDismissFct) {
    const popover = await pop;

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {
      if(res.data!==undefined) {
        // Pass data to the arrow function.
        onDismissFct(res.data);
      }
    });
  }


  async informationPopover(information, ev) {
    const popover = await this.popoverCtrl.create({
      component: InformationComponent,
      cssClass: 'informationCss',
      backdropDismiss: true,
      translucent: true,
      keyboardClose: false,
      showBackdrop: false,
      event: ev,  // Use event to present the popover next to the element clicked.
      componentProps: {info: information},
    });

    // Show popover.
    await popover.present();
  }


  // This function checks for available devices. If the passed UUID is within the devices string, res.available = true.
  checkForAvailableDevicesInString(devicesString, uuid) {
    const devicesSplit = devicesString.split(':::');
    const newDevicesSplit = [];  // Copy devices into this array without pushing empty strings to it.

    let deviceAvailable = false;
    devicesSplit.forEach(device => {
      if(device!=='') {
        newDevicesSplit.push(device);
      }
      if(device === uuid) {
        deviceAvailable = true;
      }
    });

    const res = {
      available: deviceAvailable,
      devices: newDevicesSplit,
    };

    return res;
  }


  async showToast(info: string, toastLength: number) {
    const toast = await this.toastCtrl.create({
      message: info,
      duration: toastLength,
      position: 'middle',
    });
    toast.present();
  }


  createDateTimestamp() {
    const now = new Date();
    const year = '' + now.getFullYear();
    const month = '0' + (now.getMonth() + 1);
    const day = '0' + now.getDate();
    const timestamp = year + month.slice(-2) + day.slice(-2);

    return timestamp;
  }


  async createInfoModal(infoId, infoTitle) {
    const modal = await this.modalCtrl.create({
      component: ModalInfoPage,
      cssClass: 'modalFullscreenCss',
      showBackdrop: false,
      componentProps: {
        id: infoId,
        title: infoTitle,
      }
    });

    // Show modal.
    await modal.present();
    // Get data passed during modal dismiss.
    await modal.onDidDismiss().then(res => {

    });
  }


  writeFileToDevice(subPath, fileName, fileType, fileContent, successFct) {
    let path = '';
    if(this.plt.is('android')) {
      path = this.file.externalRootDirectory + subPath;
    }
    else if (this.plt.is('ios')) {
      path = this.file.tempDirectory;
    }

    this.file.writeFile(path, fileName, fileContent, { replace: false, }).then(entry => {
      successFct(path);
    }).catch(err => {
      if(err.code === 12) {
        // If file already available, ask for permission to overwrite.
        const alertInfo: AlertInfo = {
          header: 'Datei überschreiben',
          subHeader: '',
          message: 'Möchten Sie die Datei ' + fileName + ' ersetzen?'
        };

        const arrowFunction = () => {
          this.file.writeFile(path, fileName, fileContent, { replace: true, }).then(entry => {
            successFct(path);
          });
        };

        this.createSimpleAlert(alertInfo, arrowFunction);
      }
    });

  }



  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
}


