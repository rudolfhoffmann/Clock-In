/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular';

import { ref, getDatabase, set, get, update } from '@firebase/database';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

import { LocalStorageService } from 'src/app/my-services/local-storage.service';
import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { IAPProductOptions, InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { SubscriptionComponent } from 'src/app/my-components/subscription/subscription.component';
import { InAppPurchasesService } from 'src/app/my-services/in-app-purchases.service';



@Component({
  selector: 'app-modal-registration',
  templateUrl: './modal-registration.page.html',
  styleUrls: ['./modal-registration.page.scss'],
})
export class ModalRegistrationPage implements OnInit {
  //----- Member Variables -----
  @Input() email;

  formGroup: FormGroup;


  realtimeDB;
  refDB;
  refAccountEmail;

  customerBranch;
  branchPassword;
  adminPassword;

  subscriptionChosen = false;
  subId = 'clockin.business.starter';
  subScriptionName = 'Business Starter';
  subscriptionPeriod: string;
  subscriptionTotalPrice = 0;

  currency = '€';


  disableSubscriptions = false;
  subChosenSubscription;


  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,  // Object to handle form validation.
    private storageService: LocalStorageService,
    private globalFunctions: GlobalFunctionsService,
    private popoverCtrl: PopoverController,
    private navCtrl: NavController,
    private plt: Platform,
    private store: InAppPurchase2,
    private iapService: InAppPurchasesService,
  ) {
    this.formGroup = this.formBuilder.group({
      // Define validations.
      customerBranchCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      branchPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      adminPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      adminPasswordConfirmCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      emailCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(30), Validators.required, Validators.email,
      ])],
    });

    // Subscription
    this.plt.ready().then(() => {
      this.iapService.registerProducts();
      this.iapService.setupListeners();
    });
  }

  ngOnInit() {
    this.realtimeDB = getDatabase();
    this.refDB = ref(this.realtimeDB);

    // Use patchValue() to set only some values. With setValue() all values have to be set.
    this.formGroup.patchValue({
      emailCtrl: this.email
    });

    /*
    // If subscription already available (owned status), then only new standard account can be created.
    this.subChosenSubscription = this.iapService.getSubChosenState().subscribe(chosen => {
      this.subscriptionChosen = chosen;
      this.disableSubscriptions = chosen;
    });
    */
   // If subscription already available (owned status), registration not possible.
   this.subChosenSubscription = this.iapService.getSubChosenState().subscribe(chosen => {
     if(chosen) {
      const alertInfo: AlertInfo = {
        header: 'Konto vorhanden',
        subHeader: '',
        message: 'Sie haben bereits ein kostenpflichtiges Konto erstellt. Eine Registrierung ist somit nicht möglich.',
      };
      const arrowFunction = () => {
        this.navCtrl.navigateRoot('/home');
        this.modalCtrl.dismiss();
      };
      this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
     }
  });
  }


  ionViewDidLeave() {
    // Unsubscribe subscribted/observed BehaviourSubjects, in order to avoid multiple subscriptions.
    this.subChosenSubscription.unsubscribe();
  }


  async chooseSubscription() {
    const popover = await this.popoverCtrl.create({
      component: SubscriptionComponent,
      cssClass: 'introSliderCss',
      backdropDismiss: true,
      translucent: true,
    });

    // Show popover.
    await popover.present();

    // Use onWillDismiss instead of onDidDismiss to achieve a flowlier transition for rendering the new calculated prices!
    await popover.onWillDismiss().then(res => {
      if(res !== undefined && res !== null) {
        this.subId = res.data.subId;
        this.subScriptionName = res.data.subName;
        this.subscriptionPeriod = res.data.subPeriod;
        this.subscriptionTotalPrice = res.data.subTotalPrice;
        this.subscriptionChosen = true;
      }
    });
  }


  // Validate, that passwords match.
  matchPassword() {
    const apw = this.formGroup.get('adminPasswordCtrl').value;
    const acpw = this.formGroup.get('adminPasswordConfirmCtrl').value;
    if(apw === acpw) {
      return true;
    }

    return false;
  }



  async register() {
    // Check, if customer branch already exists.
    this.customerBranch = this.formGroup.get('customerBranchCtrl').value;
    const refCustomerBranchConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);
    const customerBranchAvailable = (await get(refCustomerBranchConfig)).exists();

    // Check, if email already exists.
    let email: string = this.email;
    email = email.toLowerCase();
    this.refAccountEmail = ref(this.realtimeDB, environment.dbAccountEmailBranch);
    const accountEmail = await get(this.refAccountEmail);
    let accountEmailVals = {};
    if(accountEmail.exists()) {
      accountEmailVals = accountEmail.val();
    }
    const emails = Object.values(accountEmailVals);
    const emailAvail = emails.includes(email);

    // If passwords match and customer branch not already available, complete registration. Otherwise, show alert.
    if(customerBranchAvailable) {
      const alertInfo: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: 'Dieser Kontoname wird bereits verwendet. Wählen Sie einen anderen Kontonamen aus!',
      };
      this.globalFunctions.createInfoAlert(alertInfo, () => {});
    }
    else if(emailAvail) {
      const alertInfo: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: 'Diese E-Mail wird bereits für ein anderes Konto verwendet. Wählen Sie eine andere E-Mail aus!',
      };
      this.globalFunctions.createInfoAlert(alertInfo, () => {});
    }
    else if(!this.matchPassword()) {
      const alertInfo: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: 'Passwörter stimmen nicht überein!',
      };
      this.globalFunctions.createInfoAlert(alertInfo, () => {});
    }
    else {
      this.branchPassword = this.formGroup.get('branchPasswordCtrl').value;
      this.adminPassword = this.formGroup.get('adminPasswordCtrl').value;

      const aboConfig = {};
      aboConfig[environment.dbConfigBranch] = {
        activated: true,
        testVersion: false,
        expireDate: (new Date()).getTime() + 1000*3600*24*30,  // 30 days free usage for testing.
        registeredDevices: '',  // separate devices with :::
        blockedDevices: '',  // separate devices with :::
        dataHistory: 7*6,  // days to store the data. (Depends on abonnements). Starter -> 6 weeks.
        numberUser: 1,  // (Depends on abonnements). Starter -> 1 user.
        encrypt: false,  // (Depends on abonnements). Starter -> false
        subscription: 'clockin.business.starter',
        adminEmail: email,
        emailVerified: false,
        adminPassword: this.adminPassword,
        branchPassword: this.branchPassword,
      };

      const updateCustomerConfigBranch = {};
      updateCustomerConfigBranch[this.customerBranch] = aboConfig;

      const updateAccountEmail = {};
      updateAccountEmail[this.customerBranch] = email;

      const data = {
        registerSuccess: true,
        supervisorPassword: this.adminPassword,
        customerBranch: this.customerBranch,
      };

      // Subscribe
      // If subscription not for free (business starter), make a purchase.
      if(this.subscriptionTotalPrice > 0) {
        this.iapService.order(this.subId);
        // Wait, until product is approved, verified, finished and owned before leaving registration page.
        /* NOT NECESSARY. WHEN SUPERVISOR LOGS IN TO ADMINUI, A LISTENERS CHECKS FOR OWNED PRODCUTS AND UPDATES PARAMETERS!
        this.store.when('subscription').owned(product => {
          if(product.id === this.iapService.SUB.STANDARD_MONTH.ID || product.id === this.iapService.SUB.STANDARD_ANNUAL.ID) {
            // 5 users and 90 days
            updateCustomerConfigBranch['dataHistory'] = 90;
            updateCustomerConfigBranch['numberUser'] = 5;
            updateCustomerConfigBranch['subscription'] = product.id;
          }
          else if(product.id === this.iapService.SUB.PLUS_MONTH.ID || product.id === this.iapService.SUB.PLUS_ANNUAL.ID) {
            // 20 users and 365 days
            updateCustomerConfigBranch['dataHistory'] = 365;
            updateCustomerConfigBranch['numberUser'] = 20;
            updateCustomerConfigBranch['subscription'] = product.id;
          }
          else if(product.id === this.iapService.SUB.ENTERPRISE_MONTH.ID || product.id === this.iapService.SUB.ENTERPRISE_ANNUAL.ID) {
            // 50 users and unlimited days (100.000 days)
            updateCustomerConfigBranch['dataHistory'] = this.iapService.UNLIMITED_HISTORY;
            updateCustomerConfigBranch['numberUser'] = 50;
            updateCustomerConfigBranch['subscription'] = product.id;
          }

          this.updateAccount(updateCustomerConfigBranch, updateAccountEmail);
          this.closeModal(data);
        });
        */
      }
      // If no purchase made, just leave registration page.
      else {
        //this.updateAccount(updateCustomerConfigBranch, updateAccountEmail);
        //this.closeModal(data);
      }
      this.updateAccount(updateCustomerConfigBranch, updateAccountEmail);
      this.closeModal(data);
    }
  }


  async updateAccount(updateCustomerConfigBranch, updateAccountEmail) {
    // Update config branch.
    await update(this.refDB, updateCustomerConfigBranch);

    // Update account email branch.
    await update(this.refAccountEmail, updateAccountEmail);

    await this.setAccountCredentials();
  }




  async setAccountCredentials() {
    await this.storageService.set('customerBranch', this.customerBranch);
    await this.storageService.set('branchPassword', this.branchPassword);
  }


  async infoPopoverAccount(ev) {
    const information = 'Mit den Kontozugangsdaten können weitere Benutzer Ihrem Konto beitreten.';
    this.globalFunctions.informationPopover(information, ev);
  }

  async infoPopoverAdmin(ev) {
    let information = 'Der Administrator kann die Zeiten aller Benutzer einsehen und hat die Rechte, ';
    information += 'die Benutzer und Einstellungen zu verwalten. ';
    information += 'Der Administrator muss sich mit dem Administrator-Passwort authentifizieren. ';
    information += 'Behandeln Sie das Passwort daher vertraulich!';
    this.globalFunctions.informationPopover(information, ev);
  }


  closeModal(data) {
    this.modalCtrl.dismiss(data);
  }

}
