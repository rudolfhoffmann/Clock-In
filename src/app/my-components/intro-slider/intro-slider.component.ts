/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { IonSlides, PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-intro-slider',
  templateUrl: './intro-slider.component.html',
  styleUrls: ['./intro-slider.component.scss'],
})
export class IntroSliderComponent implements OnInit {
  // ----- Static Variables -----
  BTN_SKIP = 'Überspringen';
  BTN_BACK = 'Zurück';
  BTN_NEXT = 'Weiter';
  BTN_CLOSE = 'Schließen';

  // ----- Member Variables -----
  @ViewChild('slidesID', {read: IonSlides}) slides: IonSlides;
  slideOptions = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 400,
  };

  firstButtonName = 'Überspringen';
  lastButtonName = 'Weiter';

  // Set manually, since this.slides.length() not working for me.
  numberSlides = 4;
  currentIndex = 0;

  constructor(
    private popoverCtrl: PopoverController,
    private zone: NgZone,
  ) { }

  ngOnInit() {
  }


  ionViewDidEnter() {
    this.slides.update();
  }


  async slideChanged(ev) {
    this.currentIndex = await this.slides.getActiveIndex();

    // On clicking prev or next button, the naming of these buttons is performed.
    // Change potentially naming, if not the buttons are used, but the swiper. In this case,
    // the functions prev() and next() are not executed.
    // Set 0 as direction, since slider is already changed.
    this.setBtnNaming(0);
  }


  async prev() {
    if(this.currentIndex === 0) {
      this.closePopover();
    } else {
      this.setBtnNaming(-1);
      this.slides.slidePrev();
    }
  }
  next() {
    if(this.currentIndex === (this.numberSlides-1)) {
      this.closePopover();
    } else {
      this.setBtnNaming(1);
      this.slides.slideNext();
    }
  }


  setBtnNaming(direction) {
    // direction -1 -> back +1 -> next
    const nextIndex = this.currentIndex + direction;

    this.zone.run(() => {
      // Button naming on first slide.
      if(nextIndex === 0) {
        this.firstButtonName = this.BTN_SKIP;
        this.lastButtonName = this.BTN_NEXT;
      }
      // Button naming on last slide.
      else if(nextIndex === (this.numberSlides-1)) {
        this.firstButtonName = this.BTN_BACK;
        this.lastButtonName = this.BTN_CLOSE;
      }
      // Button naming on slides between first and last.
      else {
        this.firstButtonName = this.BTN_BACK;
        this.lastButtonName = this.BTN_NEXT;
      }
    });
  }



  async closePopover() {
    this.popoverCtrl.dismiss();
  }
}
