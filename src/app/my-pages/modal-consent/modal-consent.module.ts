import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalConsentPageRoutingModule } from './modal-consent-routing.module';

import { ModalConsentPage } from './modal-consent.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalConsentPageRoutingModule
  ],
  declarations: [ModalConsentPage]
})
export class ModalConsentPageModule {}
