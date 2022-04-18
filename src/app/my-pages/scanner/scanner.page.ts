/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  // ----- Static Variables -----
  TOAST_LENGTH: number = 3000;

  // ----- Member Variables -----
  lightOn = false;

  timeoutSub;
  intervalSub;

  cameraShown = false;

  constructor(
    private qrScanner: QRScanner,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private globalFunctions: GlobalFunctionsService,
  ) { }

  ngOnInit() {
    // For development purposes - pretend to scan a text for emulator.
    const qrauth = environment.qrAuth + ':::';
    //this.scan4Emulator(qrauth);
    // For development purposes - pretend to scan a text for emulator.
  }


  scan4Emulator(qrauth) {
    const arrowFunction = (data) => {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          qrcode: qrauth + data.qrcontent,
          time: data.time,
          isTestRun: true,
        }
      };
      this.navCtrl.navigateForward('/feedback', navigationExtras);
    };
    const alertInfo = {
      header: 'Manueller Scan',
      subHeader: '',
      message: 'Inhalt des QR-Codes, der übertragen werden soll (Test-Zwecke)',
    };
    const inputList = [
      {
        name: 'qrcontent',  // Use data.qrcontent to have reference to this input.
        type: 'textarea',
        placeholder: 'Inhalt des QR-Codes'
      },
      {
        name: 'time',  // Use data.time to have reference to this input.
        type: 'text',
        placeholder: 'h:m',
      }
    ];
    this.globalFunctions.createInputDialog(alertInfo, inputList, arrowFunction);
  }


  ionViewWillEnter() {
    this.requestQRPermission();
  }

  ionViewWillLeave() {
    clearInterval(this.intervalSub);
    clearTimeout(this.timeoutSub);
  }

  // Request and handle permission for camera access.
  // Append the following code snippet to scanner.page.scss:
  /*
      ion-content,body, .app-root, ion-app, .scroll-content, .fixed-content, page-app {
        background: none transparent !important;
      }
  */
  // Don't use the <ion-content> tag in this case.
  requestQRPermission() {
    // Optionally request the permission early
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if(status.authorized) {
        // camera permission was granted
        // start scanning
        const scanSub = this.qrScanner.scan().subscribe((text: string) => {
          // Hide scanner before leaving page.
          this.qrScanner.hide().then(() => {
            this.cameraShown = false;
          });
          this.qrScanner.disableLight();
          // Unsubscrbe scanner after scanning.
          scanSub.unsubscribe();

          // Pass data to another page.
          const navigationExtras: NavigationExtras = {
            queryParams: {
              qrcode: text,
              isTestRun: false,
            }
          };
          this.navCtrl.navigateForward('/feedback', navigationExtras);
        });

        // Show camera for scanning.
        this.qrScanner.show().then(() => {
          this.cameraShown = true;

          // When scanner shown, wait for 2 seconds and notify, that qr-code is being searched.
          this.timeoutSub = setTimeout(() => {
            this.showToast('Suche QR-Code');
          }, 2000);

          // Periodically notify, that qr-code can't be found and after that notify, that it is still being searched.
          this.intervalSub = setInterval(() => {
            this.showToast('QR-Code kann nicht gefunden werden');
            this.timeoutSub = setTimeout(() => {
              this.showToast('Suche QR-Code');
            }, this.TOAST_LENGTH);
          }, 15000);
        });

      } else if (status.denied) {
        // Camera permission was permanently denied.
        // Use QRScanner.openSettings() method to guide the user to the settings page, in order to grant the permission.
        this.noPermission();

      } else {
        // Permission was denied, but not permanently. You can ask for permission again at a later time.
        this.noPermission();
      }
    }).catch((e: any) => {
      this.noPermission();
    });
  }


  async showToast(info: string) {
    const toast = await this.toastCtrl.create({
      message: info,
      duration: this.TOAST_LENGTH,
      position: 'middle',
    });
    toast.present();
  }


  // If no permission for camera access, navigate back and possibly open settings to grant permission.
  noPermission() {
    this.alertCtrl.create({
      header: '',
      subHeader: '',
      message: 'Zugriff auf Kamera verweigert. Einstellungen öffnen, um Zugriff zu erlauben?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.navCtrl.pop();
            this.qrScanner.openSettings();
          }
        },
        {
          text: 'Nein',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }



  switchLightOn() {
    this.lightOn = true;
    this.qrScanner.enableLight();
    this.qrScanner.show();
  }

  switchLightOff() {
    this.lightOn = false;
    this.qrScanner.disableLight();
    this.qrScanner.hide();
  }


  // Workaround for bug: On Android, use qrscanner.hide() to show camera and qrscanner.show() to hide camera.
  triggerCamera() {
    if(this.cameraShown) {
      this.qrScanner.hide().then(() => {
        this.cameraShown = false;
      });
    } else {
      this.qrScanner.show().then(() => {
        this.cameraShown = true;
      });
    }
  }

}
