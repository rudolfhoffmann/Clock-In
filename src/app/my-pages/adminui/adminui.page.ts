/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, NgZone } from '@angular/core';

import { NavController, ModalController, PopoverController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { onValue, ref, getDatabase, get, set, remove, update } from '@firebase/database';
import { ModalStatusHistoryPage } from '../modal-status-history/modal-status-history.page';
import { ActionMenuAdminComponent } from 'src/app/my-components/action-menu-admin/action-menu-admin.component';

import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { UsernameComponent } from 'src/app/my-components/username/username.component';
import { SimpleInputComponent } from 'src/app/my-components/simple-input/simple-input.component';

import { File } from '@ionic-native/file/ngx';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';
import { Device } from '@capacitor/device';
import { InAppPurchasesService } from 'src/app/my-services/in-app-purchases.service';




@Component({
  selector: 'app-adminui',
  templateUrl: './adminui.page.html',
  styleUrls: ['./adminui.page.scss'],
})
export class AdminuiPage implements OnInit {
  // ----- Member Variables -----
  uuid: string;

  devicesUuid: string[];
  devicesFound = true;

  devicesPath: string;
  configPath: string;

  realtimeDB: any;
  dbRef: any;  // Reference to nodes of database.
  dbRefConfig: any;  // Reference to config branch of database.

  data: any;
  dataConfig: any;

  blockedDevicesObj: any = {};

  // While devices are loading, this flag is true and the spinner is visible.
  devicesLoading = true;

  customerBranch: string;

  subIdSubscription;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private zone: NgZone,
    private globalFunctions: GlobalFunctionsService,
    private plt: Platform,
    private file: File,
    private storageService: LocalStorageService,
    private iapService: InAppPurchasesService,
  ) { }

  async ngOnInit() {
    await this.plt.ready();  // Wait until platform is loaded completely.
    this.uuid = (await Device.getId()).uuid;

    this.customerBranch = await this.storageService.get('customerBranch');  // Fetch customerBranch stored in local storage after login.
    this.devicesPath = await this.customerBranch + '/' + environment.dbDevicesBranch;
    this.configPath = await this.customerBranch + '/' + environment.dbConfigBranch;
    this.realtimeDB = getDatabase();
    this.dbRef = ref(this.realtimeDB, this.devicesPath);
    this.dbRefConfig = ref(this.realtimeDB, this.configPath);

    // Read configuration from real time database.
    onValue(this.dbRefConfig, (snapshot) => {
      this.dataConfig = snapshot.val();
    });

    // Read from real time database.
    onValue(this.dbRef, (snapshot) => {
      // Force view to be updated.
      this.zone.run(() => {
        this.data = snapshot.val();
      if(this.data!==null) {
        this.devicesUuid = Object.keys(this.data);
        this.devicesFound = true;

        this.createBlockedDevicesObject();

      } else {
        this.devicesUuid = [];
        this.devicesFound = false;
      }

      this.devicesLoading = false;  // Spinner is hidden and paused.
      });

      const dbRefConfig = ref(this.realtimeDB, this.configPath);
      get(dbRefConfig).then((res) => {
        const config = res.val();
        const historyDays = config.dataHistory;

        this.deleteOldData(this.data, historyDays);
      });
    });


    this.checkSubscription();
  }

  ionViewDidLeave() {
    this.subIdSubscription.unsubscribe();
  }



  // Check owned products (which subscription) and update parameters.
  checkSubscription() {
    this.iapService.setupListeners();

    this.subIdSubscription = this.iapService.getSubIdState().subscribe(subId => {
      alert(subId + '\nUpdate');
      // If cancelled, update config parameters to Business Standard.
      const updateConfigBranch = {};
      if(subId === '') {
        updateConfigBranch['numberUser'] = 1;
        updateConfigBranch['dataHistory'] = 42;
        updateConfigBranch['subscription'] = 'clockin.business.starter';
      }
      else if(subId === this.iapService.SUB.STANDARD_MONTH.ID || subId === this.iapService.SUB.STANDARD_ANNUAL.ID) {
        // 5 users and 90 days
        updateConfigBranch['dataHistory'] = 90;
        updateConfigBranch['numberUser'] = 5;
        updateConfigBranch['subscription'] = subId;
      }
      else if(subId === this.iapService.SUB.PLUS_MONTH.ID || subId === this.iapService.SUB.PLUS_ANNUAL.ID) {
        // 20 users and 365 days
        updateConfigBranch['dataHistory'] = 365;
        updateConfigBranch['numberUser'] = 20;
        updateConfigBranch['subscription'] = subId;
      }
      else if(subId === this.iapService.SUB.ENTERPRISE_MONTH.ID || subId === this.iapService.SUB.ENTERPRISE_ANNUAL.ID) {
        // 50 users and unlimited days (100.000 days)
        updateConfigBranch['dataHistory'] = this.iapService.UNLIMITED_HISTORY;
        updateConfigBranch['numberUser'] = 50;
        updateConfigBranch['subscription'] = subId;
      }

      update(this.dbRefConfig, updateConfigBranch);
    });
  }


  // Create a JSON-Object, in which all device UUIDs are used as keys and a boolean value defines, if this device is blocked or not.
  // True = blocked. False = not blocked.
  createBlockedDevicesObject() {
    this.devicesUuid.forEach(deviceUuid => {
      const res = this.globalFunctions.checkForAvailableDevicesInString(this.dataConfig.blockedDevices, deviceUuid);
      if(res.available) {
        this.blockedDevicesObj[deviceUuid] = true;
      } else {
        this.blockedDevicesObj[deviceUuid] = false;
      }
    });
  }

  // Delete all data, that is older than specified history data age.
  deleteOldData(data, historyDays) {
    // Iterate over all devices.
    const deviceKeys = Object.keys(data);
    deviceKeys.forEach(deviceKey => {
      // Iterate over list of checkins of each device.
      const checkins = data[deviceKey].checkins;
      const checkinKeys = Object.keys(checkins);
      checkinKeys.forEach(checkinKey => {
        // Determine date, when checkin was created.
        const checkinCreatedInMillis = checkins[checkinKey].timestamp;

        const historyDaysInMillis = 1000 * 3600 * 24 * historyDays;
        const todayInMillis = (new Date()).getTime();
        if((todayInMillis - historyDaysInMillis) > checkinCreatedInMillis) {
          // Delete this checkin, because it is older than specified data history age.
          const dbRefRemove = ref(this.realtimeDB, this.devicesPath + '/' + deviceKey + '/checkins/' + checkinKey);
          remove(dbRefRemove);
        }
      });
    });
  }

  openQRCodeGenerator() {
    this.navCtrl.navigateForward('/qrgenerator');
  }



  // Create modal, in which status history of selected device is visualized.
  async modalStatusHistory(pos) {
    const deviceUuid: string = this.devicesUuid[pos];
    const username = this.data[deviceUuid].username;

    const modal = await this.modalCtrl.create({
      component: ModalStatusHistoryPage,
      cssClass: 'modalFullscreenCss',
      showBackdrop: false,
      componentProps: {
        user: username,
        checkins: this.data[deviceUuid].checkins,
      }
    });

    // Show modal.
    await modal.present();
    // Get data passed during modal dismiss.
    await modal.onDidDismiss().then(res => {

    });
  } // modalStatusHistory end



  // Open popover action menu.
  async openActionMenu(uuid, index, ev) {
    const popover = await this.popoverCtrl.create({
      component: ActionMenuAdminComponent,
      cssClass: 'actionMenuAdminCss',
      translucent: true,
      event: ev,  // Use event to present the popover next to the element clicked.
      showBackdrop: false,
      keyboardClose: true,
    });

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {
      if(res.data!==undefined) {
        const action = res.data.action;

        this.runMenuAction(action, uuid, index);
      }
    });
  }



  // Execute action selected from the popver action menu.
  runMenuAction(action, uuid, index) {
    // Open history modal to see records of clock-ins/outs.
    if(action===0) {
      this.modalStatusHistory(index);
    }
    // Create Popover to rename the username.
    else if(action===1) {
      // Get username.
      const dbRefUsername = ref(this.realtimeDB, this.devicesPath + '/' + uuid + '/' + environment.dbUsername);
      get(dbRefUsername).then(res => {
        const user = res.val();

        // This arrow function is passed to another function as argument and executed, when called.
        // 1 Argument has to be passed to this arrow function and is stored in "data".
        const onDismissFct = (data) => {
          // Update username (set new username).
          set(dbRefUsername, data.username);
        };

        // Create and pass popover to global function, in which it is further processed.
        const popover = this.popoverCtrl.create({
          component: UsernameComponent,
          cssClass: 'promptCss',
          translucent: true,
          componentProps: {
            username: user,
            usernameType: this.globalFunctions.TYPE_USERNAME.username,
            heading: this.globalFunctions.HEADING_USERNAME,
            message: this.globalFunctions.MESSAGE_USERNAME,
          }
        });

        this.globalFunctions.createInputPopover(popover, onDismissFct);
      });
    }
    // Block the device. Append device to the list of blocked devices in the config-branch.
    else if(action===2) {
      // If selected UUID is the UUID of own device, don't block it. Otherwise, you lock yourself out!
      if(uuid === this.uuid) {
        const alertInfo: AlertInfo = {
          header: 'Achtung',
          subHeader: '',
          message: 'Eigenes Gerät kann nicht blockiert werden!'
        };
        this.globalFunctions.createInfoAlert(alertInfo, () => {});
      } else {
        let blockedDevices = this.dataConfig.blockedDevices;
        const res = this.globalFunctions.checkForAvailableDevicesInString(blockedDevices, uuid);

        // If device not already blocked, append it to blockedDevices string.
        if(!res.available) {
          blockedDevices += uuid + ':::';
          this.dataConfig.blockedDevices = blockedDevices;

          // Update blockedDevices in config branch.
          const updates = {};
          updates['/blockedDevices'] = blockedDevices;
          update(this.dbRefConfig, updates);
        }

        // Update blockedDevicesObj.
        this.createBlockedDevicesObject();
      }
    }
    // Delete the device from registeredDevices-list from config-branch and all its records.
    // Use an confirmation alert!.
    else if(action===3) {
      const alertInfo: AlertInfo = {
        header: 'Benutzer löschen',
        subHeader: '',
        message: 'Wollen Sie den Benutzer ' + this.data[uuid].username + ' wirklich löschen?',
      };

      // Action that is performed, if alert confirmed with yes.
      const arrowFunction = () => {
        // Remove records of user.
        const dbRefRemove = ref(this.realtimeDB, this.devicesPath + '/' + uuid);
        remove(dbRefRemove);

        // Remove device from registered devices.
        const regDevices = this.dataConfig.registeredDevices;
        let newRegDevices = '';
        const regDevSplit = regDevices.split(':::');

        regDevSplit.forEach(device => {
          if(device !== uuid && device !== '') {
            newRegDevices += device + ':::';
          }
        });

        // Update registered devices after removing a device.
        const updates = {};
        updates['/registeredDevices'] = newRegDevices;
        update(this.dbRefConfig, updates);
      };

      this.globalFunctions.createSimpleAlert(alertInfo, arrowFunction);
    }
    // Create input dialog to export records data either as csv or json.
    else if(action===4) {
      // Extract records of user.
      const content = this.data[uuid];
      const username = content.username;
      this.exportRecords(content, username);
    }
  }



  exportRecords(content, username) {
    const timestamp = this.globalFunctions.createDateTimestamp();
    const predefinedFilename = 'Export_' + username + '_' + timestamp;

    const popover = this.popoverCtrl.create({
      component: SimpleInputComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        filename: predefinedFilename,
        header: 'Aufzeichnung exportieren',
        message: 'Geben Sie das Format und einen Namen an, unter dem die Aufzeichnungen exportiert werden sollen.',
        exportRecords: true,
      }
    });

    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      let filename = data.filename;
      const format = data.format;
      filename += '.' + format;

      // Default format is in JSON, since Realtime DB of Firebase is in JSON. If csv, convert JSON to CSV.
      if(format==='csv') {

      }

      this.downloadAndShare(content, filename);
    };

    this.globalFunctions.createInputPopover(popover, onDismissFct);

  }


  downloadAndShare(content, fileName) {
    const subPath = '/Download/';
    const successFct = (path) => {
      this.globalFunctions.showToast('Datei wurde erfolgreich exportiert und unter Downloads gespeichert', 3000);
    };

    this.globalFunctions.writeFileToDevice(subPath, fileName, '', content, successFct);
  }


  openSettings() {
    this.navCtrl.navigateForward('/settings');
  }

}
