/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { getDatabase, ref, update } from 'firebase/database';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AlertInfo, GlobalFunctionsService } from './global-functions.service';
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
    STARTER: {
      ID: 'clockin.business.starter',
      PRICING_NET: 0.00,
    },
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

  storeHandler;


  private subChosen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private subCancelled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private subId: BehaviorSubject<string> = new BehaviorSubject(this.SUB.STARTER.ID);

  constructor(
    private store: InAppPurchase2,
    private storageService: LocalStorageService,
    private globalFunctions: GlobalFunctionsService,
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


  order(id, changed) {
    const arrowFunction = () => {};  // Do nothing.
    this.store.order(id).then(product => {
      // Purchase in progress.
      // If purchase was changed, notify with alert that purchase is in progress.
      if(changed) {
        const alertInfo: AlertInfo = {
          header: 'In Bearbeitung...',
          subHeader: '',
          message: `Es kann einige Minuten dauern, bis der Kaufvorgang abgeschlossen ist.`,
        };
        this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
      }
    }).error(error => {
      const alertInfo: AlertInfo = {
        header: 'Fehler beim Abschließen des Abos',
        subHeader: '',
        message: `Es gab einen Fehler beim Abschließen des Abos! Sie können die Abos in den Einstellungen verwalten \
                  \n\nFehlermeldung: ${error}`,
      };
      this.globalFunctions.createInfoAlert(alertInfo, arrowFunction);
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

    //this.restore();
  }


  manageSubs() {
    this.store.manageSubscriptions();
  }


  turnOff() {
    // Unsubscripe listeners when leaving page. Register subscription multiple times leads to
    // chaotical behaviour (calling owned status very often).
    // Unsubscribing the listeners multiple times is allowed! No Crash.
    this.store.off(this.storeHandler);
  }


  setupListeners() {
    // eslint-disable-next-line max-len
    this.store.validator = 'https://validator.fovea.cc/v1/validate?appName=de.innoapps.clockin&apiKey=e1d70996-33a4-4616-bd2c-b64ac87a4366';

    // Listen to all subscription. Set state for first time of subscription.
    this.storeHandler = this.store.when('subscription').approved(product => {
      product.verify();
    }).verified(product => {
      product.finish();
    })/*.owned(product => {
      // Set next value of subChosen to "true" to notify observer about state.
      this.subChosen.next(true);
      // Set product-id.
      this.subId.next(product.id);
    })*/.cancelled(() => {
      this.subCancelled.next(true);
    }).error(productError => {
      alert('Fehler beim Abonnieren: ' + JSON.stringify(productError));
    }).owned(product => {
      // Set observable, to observe subscription ID.
      this.subId.next(product.id);
    });

  }

}
