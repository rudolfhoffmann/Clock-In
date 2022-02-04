/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { getDatabase, ref, update } from 'firebase/database';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class InAppPurchasesService {
  // ----- Static Variables -----
  SUB_PERIOD = {
    ANNUAL: 'annual',
    MONTH: 'month',
  };


  SUB_VALUE = {
    STARTER: 'starter',
    STANDARD: 'standard',
    PLUS: 'plus',
    ENTERPRISE: 'enterprise',
  };

  UNLIMITED_HISTORY = 1000000;

  SUB = {
    STANDARD_MONTH: {
      ID: 'clockin.business.standard.month',
      PRICING_NET: 5.87,
    },
    STANDARD_ANNUAL: {
      ID: 'clockin.business.standard.annual',
      PRICING_NET: 58.82,
    },
    PLUS_MONTH: {
      ID: 'clockin.business.plus.month',
      PRICING_NET:11.76,
    },
    PLUS_ANNUAL: {
      ID: 'clockin.business.plus.annual',
      PRICING_NET: 117.64,
    },
    ENTERPRISE_MONTH: {
      ID: 'clockin.business.enterprise.month',
      PRICING_NET: 23.52,
    },
    ENTERPRISE_ANNUAL: {
      ID: 'clockin.business.enterprise.annual',
      PRICING_NET: 239.49,
    },
  };


  APP_FEATURES = {
    GENERATE_QR: 'QR-Code generieren',
    SCAN_QR: 'QR-Code scannen zur Zeiterfassung',
    TIME_CONTROL: 'Zeitüberwachung',
  };


  private subChosen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private subCancelled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private subId: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private store: InAppPurchase2,
    private storageService: LocalStorageService,
  ) {}


  getSubChosenState() {
    return this.subChosen.asObservable();
  }
  getSubCancelledState() {
    return this.subCancelled.asObservable();
  }
  getSubIdState() {
    return this.subId.asObservable();
  }


  order(id) {
    this.store.order(id).then(product => {
      // Purchase in progress.
    });
  }


  // To comply with App Store rules.
  restore() {
    this.store.refresh();
  }


  registerProducts() {
    this.store.register({
      id: this.SUB.STANDARD_MONTH.ID,
      type: this.store.PAID_SUBSCRIPTION,
    });
    this.store.register({
      id: this.SUB.STANDARD_ANNUAL.ID,
      type: this.store.PAID_SUBSCRIPTION
    });
    this.store.register({
      id: this.SUB.PLUS_MONTH.ID,
      type: this.store.PAID_SUBSCRIPTION,
    });
    this.store.register({
      id: this.SUB.PLUS_ANNUAL.ID,
      type: this.store.PAID_SUBSCRIPTION
    });
    this.store.register({
      id: this.SUB.ENTERPRISE_MONTH.ID,
      type: this.store.PAID_SUBSCRIPTION,
    });
    this.store.register({
      id: this.SUB.ENTERPRISE_ANNUAL.ID,
      type: this.store.PAID_SUBSCRIPTION
    });

    this.restore();
  }


  setupListeners() {
    // Listen to all subscription. Set state for first time of subscription.
    this.store.when('subscription').approved(product => {
      product.verify();
    }).verified(product => {
      product.finish();
    }).owned(product => {
      //alert(product.id);
      // Set next value of subChosen to "true" to notify observer about state.
      this.subChosen.next(true);
      // Set product-id.
      this.subId.next(product.id);

    }).cancelled(() => {
      this.subCancelled.next(true);
    }).error(productError => {
      alert('Fehler beim Abonnieren: ' + JSON.stringify(productError));
    });

  }

}
