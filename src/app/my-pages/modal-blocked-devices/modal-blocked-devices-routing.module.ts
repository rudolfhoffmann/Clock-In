import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalBlockedDevicesPage } from './modal-blocked-devices.page';

const routes: Routes = [
  {
    path: '',
    component: ModalBlockedDevicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalBlockedDevicesPageRoutingModule {}
