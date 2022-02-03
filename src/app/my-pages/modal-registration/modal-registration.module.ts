import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalRegistrationPageRoutingModule } from './modal-registration-routing.module';

import { ModalRegistrationPage } from './modal-registration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalRegistrationPageRoutingModule
  ],
  declarations: [ModalRegistrationPage]
})
export class ModalRegistrationPageModule {}
