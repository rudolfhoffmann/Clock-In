import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalBlockedDevicesPageRoutingModule } from './modal-blocked-devices-routing.module';

import { ModalBlockedDevicesPage } from './modal-blocked-devices.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalBlockedDevicesPageRoutingModule
  ],
  declarations: [ModalBlockedDevicesPage]
})
export class ModalBlockedDevicesPageModule {}
