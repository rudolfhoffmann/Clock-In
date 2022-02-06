import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PopoverController } from'@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { LocalStorageService } from '../../my-services/local-storage.service';
import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

import { ref, getDatabase, set, get, update } from '@firebase/database';

import { BlockingComponent } from 'src/app/my-components/blocking/blocking.component';
import { UsernameComponent } from 'src/app/my-components/username/username.component';
import { environment } from 'src/environments/environment';

import { Device } from '@capacitor/device';

@Component({
  selector: 'app-home-scanner',
  templateUrl: './home-scanner.page.html',
  styleUrls: ['./home-scanner.page.scss'],
})
export class HomeScannerPage implements OnInit {
  uuid: string;

  formGroup: FormGroup;

  customerBranch: string;
  branchPassword: string;

  realtimeDB;
  dbRefConfig: any;  // Reference to config node of database.

  dataConfig: any;

  constructor(
    private storageService: LocalStorageService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private formBuilder: FormBuilder,  // Object to handle form validation.
    private globalFunctions: GlobalFunctionsService,
  ) {
    this.formGroup = this.formBuilder.group({
      // Define validations.
      customerBranchCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      branchPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
    });

  }

  ngOnInit() {
  }


  async ionViewDidEnter() {
    this.uuid = (await Device.getId()).uuid;
    this.realtimeDB = getDatabase();
    // Read account credentials from local storage.
    await this.getAccountCredentials();

    // Check, if local password and password from DB match.
    this.checkCredentialMatch();
  }


  // Read password for the customer branch from realtime database.
  // If password from realtime database matches the password from local storage, navigate to clockinui.
  checkCredentialMatch() {
    if(this.customerBranch !== undefined && this.customerBranch !== null) {
      const refDB = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch + '/' + environment.dbBranchPassword);
      get(refDB).then((snapshot) => {
        const pw = snapshot.val();
        if(pw === this.branchPassword) {
          // If credentials correct, write them to local storage.
          this.setAccountCredentials();

          // If passwords match, read configuration from the DB.
          this.readConfigurationFromDB();

          // Redirect to clock-in UI, when home is loaded.
          // Reason: New GUI structure. Start directly from clock-in UI and navigate to admin UI from side menu.
          this.openClockInUI();
        } else {
          const alertInfo: AlertInfo = {
            header: 'Authentifizierung fehlgeschlagen',
            subHeader: '',
            message: 'Supervisor-Email und Passwort stimmen nicht überein!',
          };
          const arrowFunction = () => {
            //this.storageService.logout('/home-scanner', undefined);
          };
          this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
        }
      }).catch(() => {
        const alertInfo: AlertInfo = {
          header: 'Anmeldung fehlgeschlagen',
          subHeader: '',
          message: 'Anmeldedaten konnten nicht abgerufen werden. Möglicherweise ist keine Internetverbindung vorhanden!',
        };
        this.globalFunctions.createInfoAlert(alertInfo, () => {});
      });
    }
  }


  async setAccountCredentials() {
    await this.storageService.set('customerBranch', this.customerBranch);
    await this.storageService.set('branchPassword', this.branchPassword);
  }


  async getAccountCredentials() {
    this.customerBranch = await this.storageService.get('customerBranch');
    this.branchPassword = await this.storageService.get('branchPassword');
  }


  login2Account() {
    this.customerBranch = this.formGroup.get('customerBranchCtrl').value;
    this.branchPassword = this.formGroup.get('branchPasswordCtrl').value;

    this.checkCredentialMatch();
  }


  openClockInUI() {
    this.navCtrl.navigateRoot('/clockinui');
  }


  readConfigurationFromDB() {
    this.dbRefConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);

    get(this.dbRefConfig).then((snapshot) => {
      this.dataConfig = snapshot.val();
      this.checkConfig(this.dataConfig);
    });
  }


  checkConfig(aboConfig) {
    // Check configuration and potentially disable app run.
    // If not activated, block the app.
    if(!aboConfig.activated) {
      this.showBlockingPopover(0);
    }

    // Check, if device is blocked from administrator.
    const blocked = this.checkBlockedDevices(aboConfig);

    if(blocked) {
      this.showBlockingPopover(3);
    } else {
      // If it's a test version, check expire date.
      aboConfig = this.checkTestExpiration(aboConfig);

      // Check registration of device and number of registered devices.
      this.checkRegistratedDevices(aboConfig);
    }
  }


  // Check expiration of the test version and return the new configuration.
  checkTestExpiration(aboConfig) {
    // If it's a test version, check if test time range expired.
    if(aboConfig.testVersion) {
      // if date expired, block the app.
      if((new Date()).getTime() > aboConfig.expireDate) {
        this.showBlockingPopover(1);

        // Change status (it's not a test version anymore).
        aboConfig.testVersion = false;
        set(this.dbRefConfig, aboConfig).then(() => {
          // After setting configuration, check, if app is running under appropriate conditions.
          this.checkConfig(aboConfig);
        }).catch(err => {
          alert(err);
        });
      }
    }

    return aboConfig;
  }


  // Check if device registrated and maximum number of devices not exceeded.
  checkRegistratedDevices(aboConfig) {
    let regDevices = aboConfig.registeredDevices;
    const res = this.globalFunctions.checkForAvailableDevicesInString(regDevices, this.uuid);

    // If device not already registered and the maximum number of users not reached, register device.
    if(aboConfig.numberUser > res.devices.length && !res.available) {
      regDevices += this.uuid + ':::';

      aboConfig.registeredDevices = regDevices;
      // Create popover, in which to set username. After setting username, register the device.
      this.usernamePopover(aboConfig);
    }
    // If maximum number of users reached and device not already registered, block the app.
    else if(aboConfig.numberUser <= res.devices.length && !res.available) {
      this.showBlockingPopover(2);
    }
  }


  // Check, if device is blocked.
  checkBlockedDevices(aboConfig) {
    let blocked = false;
    const blockedDevices = aboConfig.blockedDevices;
    const res = this.globalFunctions.checkForAvailableDevicesInString(blockedDevices, this.uuid);
    if(res.available) {
      blocked = true;
    }

    return blocked;
  }


  async showBlockingPopover(code) {
    // code: 0 -> not activated; 1 -> test version expired; 2 -> maximum number of devices exceeded
    const popover = await this.popoverCtrl.create({
      component: BlockingComponent,
      cssClass: 'blockingCss',
      backdropDismiss: false,
      translucent: true,
      componentProps: { blockingcode: code },
    });

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {

    });
  }


  async usernamePopover(aboConfig) {
    const popover = await this.popoverCtrl.create({
      component: UsernameComponent,
      cssClass: 'promptCss',
      backdropDismiss: false,
      translucent: true,
      componentProps: {
        username: '',
        usernameType: this.globalFunctions.TYPE_USERNAME.username,
        heading: this.globalFunctions.HEADING_USERNAME,
        message: this.globalFunctions.MESSAGE_USERNAME,
      }
    });

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {
      const dbRefUuid = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbDevicesBranch + '/' +
      this.uuid + '/' + environment.dbUsername);

      // Register device and set username.
      const updateRegDevices = {};
      updateRegDevices[environment.dbRegisteredDevices] = aboConfig.registeredDevices;
      update(this.dbRefConfig, updateRegDevices);
      set(dbRefUuid, res.data.username);
    });
  }


}
