import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, PopoverController } from '@ionic/angular';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { InAppPurchasesService } from 'src/app/my-services/in-app-purchases.service';


@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit {
  // ----- Member Variables -----
  // static = true -> initialize in ngOnInit ; static = false -> initialize in ngAfterViewInit
  @ViewChild('slidesIDSub', {read: IonSlides, static: true}) slides: IonSlides;
  /*slides: IonSlides;
  @ViewChild('slidesIDSub') set content(ionSlides: IonSlides) {
    alert(ionSlides);
    if(ionSlides) {
      this.slides = ionSlides;
      alert(this.slides);
    }
  }*/
  slideOptions = {
    initialSlide: 1,
    slidesPerView: 1,
    speed: 400,
  };
  currentIndex = 0;
  name;


  sub = {
    starter: {
      name: 'Business Starter',
      desc: '',
      benefits: ['1 Benutzer pro Konto', 'Daten werden 6 Wochen lang gespeichert',
        this.iapService.APP_FEATURES.GENERATE_QR,
        this.iapService.APP_FEATURES.SCAN_QR, this.iapService.APP_FEATURES.TIME_CONTROL],
      pricing: {
        net: 0,
        total: 0,
      },
    },
    standard: {
      name: 'Business Standard',
      desc: '',
      benefits: ['5 Benutzer pro Konto', 'Daten werden 3 Monate lang gespeichert',
        this.iapService.APP_FEATURES.GENERATE_QR,
        this.iapService.APP_FEATURES.SCAN_QR, this.iapService.APP_FEATURES.TIME_CONTROL],
      pricing: {
        net: 0,
        total: 0,
      },
    },
    plus: {
      name: 'Business Plus',
      desc: '',
      benefits: ['20 Benutzer pro Konto', 'Daten werden 1 Jahr lang gespeichert',
        this.iapService.APP_FEATURES.GENERATE_QR,
        this.iapService.APP_FEATURES.SCAN_QR, this.iapService.APP_FEATURES.TIME_CONTROL],
      pricing: {
        net: 0,
        total: 0,
      },
    },
    enterprise: {
      name: 'Enterprise',
      desc: '',
      benefits: ['50 Benutzer pro Konto', 'Daten werden auf unbegrenzte Dauer gespeichert',
        this.iapService.APP_FEATURES.GENERATE_QR,
        this.iapService.APP_FEATURES.SCAN_QR, this.iapService.APP_FEATURES.TIME_CONTROL],
      pricing: {
        net: 0,
        total: 0,
      },
    },
  };
  subValueList = ['starter', 'standard', 'plus', 'enterprise'];
  numberSlides = this.subValueList.length;
  subValue = this.subValueList[this.slideOptions.initialSlide];
  subPeriod = this.iapService.SUB_PERIOD.ANNUAL;
  vat = 0.19;
  currency = '€';

  constructor(
    private globalFunctions: GlobalFunctionsService,
    private popoverCtrl: PopoverController,
    private iapService: InAppPurchasesService,
  ) { }

  ngOnInit() {
    this.setPrices();
  }


  ionViewWillEnter() {
    // Wait for a second to load this popover before visualizing.
    setTimeout(() => {
      this.slideChanged();
    }, 1000);
  }


  ionViewDidEnter() {
    this.slides.update();
  }



  setSubPeriod(period) {
    this.subPeriod = period;
    this.setPrices();
  }




  setPrices() {
    let net = 0;
    let total = 0;

    if(this.subValue === this.iapService.SUB_VALUE.STANDARD && this.subPeriod === this.iapService.SUB_PERIOD.ANNUAL) {
      net = this.iapService.SUB.STANDARD_ANNUAL.PRICING_NET;
    }
    else if(this.subValue === this.iapService.SUB_VALUE.STANDARD && this.subPeriod === this.iapService.SUB_PERIOD.MONTH) {
      net = this.iapService.SUB.STANDARD_MONTH.PRICING_NET;
    }

    else if(this.subValue === this.iapService.SUB_VALUE.PLUS && this.subPeriod === this.iapService.SUB_PERIOD.ANNUAL) {
      net = this.iapService.SUB.PLUS_ANNUAL.PRICING_NET;
    }
    else if(this.subValue === this.iapService.SUB_VALUE.PLUS && this.subPeriod === this.iapService.SUB_PERIOD.MONTH) {
      net = this.iapService.SUB.PLUS_MONTH.PRICING_NET;
    }

    else if(this.subValue === this.iapService.SUB_VALUE.ENTERPRISE && this.subPeriod === this.iapService.SUB_PERIOD.ANNUAL) {
      net = this.iapService.SUB.ENTERPRISE_ANNUAL.PRICING_NET;
    }
    else if(this.subValue === this.iapService.SUB_VALUE.ENTERPRISE && this.subPeriod === this.iapService.SUB_PERIOD.MONTH) {
      net = this.iapService.SUB.ENTERPRISE_MONTH.PRICING_NET;
    }

    // If error in rounding (x.00) then substract by -0.01 to obtain y.99
    total = Math.round(net * (this.vat+1) * 100) / 100;
    if(net.toString().length > total.toString().length) {
      total -= 0.01;
    }

    // If annual period, calculate annually price into monthly price.
    if(this.subPeriod === this.iapService.SUB_PERIOD.ANNUAL) {
      total = net * (this.vat+1) / 12;
      total = Math.round(total * 100) / 100;
    }


    this.sub[this.subValue].pricing.net = net;
    this.sub[this.subValue].pricing.total = total;
  }


  async slideChanged() {
    this.currentIndex = await this.slides.getActiveIndex();
    this.subValue = this.subValueList[this.currentIndex];
    this.setPrices();
  }


  choose() {
    const id = `clockin.business.${this.subValue}.${this.subPeriod}`;
    const data = {
      subId: id,
      subName: this.sub[this.subValue].name,
      subPeriod: this.subPeriod,
      subTotalPrice: this.sub[this.subValue].pricing.total,
    };

    this.popoverCtrl.dismiss(data);
  }

}
