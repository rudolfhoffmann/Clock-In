/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Device } from '@capacitor/device';

import { onValue, getDatabase, get, ref, set, update } from '@firebase/database';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { AdminPasswordComponent } from 'src/app/my-components/admin-password/admin-password.component';
import { UsernameComponent } from 'src/app/my-components/username/username.component';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';
import { environment } from 'src/environments/environment';
import { ModalBlockedDevicesPage } from '../modal-blocked-devices/modal-blocked-devices.page';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  // ----- Static Variables -----
  ACTION_ID = {
    USER: 'user',
    EMAIL: 'email',
    ADMIN: 'admin',
    ACCOUNT_NAME: 'accountName',
    ACCOUNT_PASSWORD: 'accountPassword',
    SUBSCRIPTION: 'subscription',
    BLOCKED_DEV: 'blockedDevices',
  };

  // ----- Member Variables -----
  settingsList: any;

  uuid: string;
  usernamePath: string;
  username: string;

  customerBranch: string;

  configPath: string;
  blockedDevices: string[] = [];
  config: any;

  realtimeDB: any;
  dbRefUsername: any;
  dbRefConfig: any;

  constructor(
    private plt: Platform,
    private actRoute: ActivatedRoute,
    private storageService: LocalStorageService,
    private globalFunctions: GlobalFunctionsService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
  ) {
  }

  async ngOnInit() {
    await this.plt.ready();
    this.customerBranch = await this.storageService.get('customerBranch');  // Fetch customerBranch stored in local storage after login.
    this.configPath = this.customerBranch + '/' + environment.dbConfigBranch;
    this.realtimeDB = getDatabase();
    this.dbRefConfig = ref(this.realtimeDB, this.configPath);

    // Fetch configuration.
    const snapshotConf = await get(this.dbRefConfig);
    this.config = snapshotConf.val();
    const blockedDevs = this.config.blockedDevices;
    const blockedDevsList: string[] = blockedDevs.split(':::');
    // Remove empty elements.
    blockedDevsList.forEach((dev) => {
      if(dev!=='') {
        this.blockedDevices.push(dev);
      }
    });

    this.uuid = (await Device.getId()).uuid;
    this.usernamePath = this.customerBranch + '/' + environment.dbDevicesBranch + '/' + this.uuid + '/' + environment.dbUsername;
    this.dbRefUsername = ref(this.realtimeDB, this.usernamePath);


    // Fetch username.
    onValue(this.dbRefUsername, (snapshotUser) => {
      this.username = snapshotUser.val();

      this.defineSettingsList();
    });

  }


  edit(action) {
    // Create popover to change username.
    if(action === this.ACTION_ID.USER) {
      this.createUsernamePopover();
    }
    // Create popover to change e-mail. Confirmation necessary.
    else if(action === this.ACTION_ID.EMAIL) {
      // Not Changable!
      //this.createEmailPopover();
    }
    // Create popover to change administration passwort. Enter old, new and new confirmation password.
    else if(action === this.ACTION_ID.ADMIN) {
      this.createAdminPasswordPopover();
    }
    else if(action === this.ACTION_ID.ACCOUNT_NAME) {
      // Not Changable!
    }
    // Create popover to change account password.
    else if(action === this.ACTION_ID.ACCOUNT_PASSWORD) {
      this.createAccountpasswordPopover();
    }
    // Create popover to show current subscription and enable up/downgrade.
    else if(action === this.ACTION_ID.SUBSCRIPTION) {

    }
    // Create modal to administrate blocked devices.
    else if(action === this.ACTION_ID.BLOCKED_DEV) {
      this.createBlockedDevicesModal();
    }
  }


  defineSettingsList() {
    this.settingsList = [
      {
        id: this.ACTION_ID.USER,
        title: 'Benutzername',
        value: this.username,
      },
      {
        id: this.ACTION_ID.EMAIL,
        title: 'E-Mail (nicht änderbar)',
        value: this.config.adminEmail,
      },
      {
        id: this.ACTION_ID.ADMIN,
        title: 'Administrator Passwort ändern',
        value: '',
      },
      // Changing account name not possible for this app, because renaming of keys not possible.
      // To rename account name, a new account has to be created and all data has to be passed to the new account.
      // This is very bandwidth expensive and thus, not implemented for this app.
      // A user can make a workaround by registering a new account and export the data and import to new account.
      {
        id: this.ACTION_ID.ACCOUNT_NAME,
        title: 'Kontoname (nicht änderbar)',
        value: this.customerBranch
      },
      {
        id: this.ACTION_ID.ACCOUNT_PASSWORD,
        title: 'Konto Passwort',
        value: this.config.branchPassword,
      },
      {
        id: this.ACTION_ID.SUBSCRIPTION,
        title: 'Abo anzeigen',
        value: '',  // Value
      },
      {
        id: this.ACTION_ID.BLOCKED_DEV,
        title: 'Blockierte Geräte verwalten',
        value: '',
      },
    ];
  }



  createUsernamePopover() {
    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      // Update username (set new username).
      set(this.dbRefUsername, data.username);
    };

    // Create and pass popover to global function, in which it is further processed.
    const popover = this.popoverCtrl.create({
      component: UsernameComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        username: this.username,
        usernameType: this.globalFunctions.TYPE_USERNAME.username,
        heading: this.globalFunctions.HEADING_USERNAME,
        message: this.globalFunctions.MESSAGE_USERNAME,
      }
    });

    this.globalFunctions.createInputPopover(popover, onDismissFct);
  }


  createEmailPopover() {
    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      // Update email.
      const updates = {};
      updates[environment.dbAdminEmail] = data.username;
      update(this.dbRefConfig, updates).then(() => {
        this.config.adminEmail = data.username;
        this.defineSettingsList();
      });
    };

    // Create and pass popover to global function, in which it is further processed.
    const popover = this.popoverCtrl.create({
      component: UsernameComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        username: this.config.adminEmail,
        usernameType: this.globalFunctions.TYPE_USERNAME.email,
        heading: this.globalFunctions.HEADING_EMAIL,
        message: this.globalFunctions.MESSAGE_EMAIL,
      }
    });

    this.globalFunctions.createInputPopover(popover, onDismissFct);
  }


  createAccountpasswordPopover() {
    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      // Update email.
      const updates = {};
      updates[environment.dbBranchPassword] = data.username;
      update(this.dbRefConfig, updates).then(() => {
        this.config.branchPassword = data.username;
        this.storageService.set('branchPassword', this.config.branchPassword);
        this.defineSettingsList();
      });
    };

    // Create and pass popover to global function, in which it is further processed.
    const popover = this.popoverCtrl.create({
      component: UsernameComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        username: this.customerBranch,
        usernameType: this.globalFunctions.TYPE_USERNAME.accountpassword,
        heading: this.globalFunctions.HEADING_ACCOUNTPASSWORD,
        message: this.globalFunctions.MESSAGE_ACCOUNTPASSWORD,
      }
    });

    this.globalFunctions.createInputPopover(popover, onDismissFct);
  }


  createAdminPasswordPopover() {
    // This arrow function is passed to another function as argument and executed, when called.
    // 1 Argument has to be passed to this arrow function and is stored in "data".
    const onDismissFct = (data) => {
      // Update admin password.
      const updates = {};
      // eslint-disable-next-line @typescript-eslint/dot-notation
      updates[environment.dbAdminPassword] = data.adminPassword;
      update(this.dbRefConfig, updates).then(() => {
        this.config.adminPassword = data.adminPassword;
        this.defineSettingsList();
      });
    };

    // Create and pass popover to global function, in which it is further processed.
    const popover = this.popoverCtrl.create({
      component: AdminPasswordComponent,
      cssClass: 'promptCss',
      translucent: true,
      componentProps: {
        oldPassword: this.config.adminPassword,
      }
    });

    this.globalFunctions.createInputPopover(popover, onDismissFct);
  }


  async createBlockedDevicesModal() {
    const modal = await this.modalCtrl.create({
      component: ModalBlockedDevicesPage,
      cssClass: 'modalFullscreenCss',
      showBackdrop: false,
      componentProps: {
        blockedDevices: this.blockedDevices,
      }
    });

    // Show modal.
    await modal.present();
    // Get data passed during modal dismiss.
    await modal.onDidDismiss().then(res => {
      // Update blocked devices.
      this.blockedDevices = res.data.blockedDevices;
      let blockedDevices = '';
      this.blockedDevices.forEach(dev => {
        blockedDevices += dev + ':::';
      });

      const updates = {};
      // eslint-disable-next-line @typescript-eslint/dot-notation
      updates['blockedDevices'] = blockedDevices;
      update(this.dbRefConfig, updates).then(() => {
        this.config.blockedDevices = blockedDevices;
        this.defineSettingsList();
      });
    });
  }
}
