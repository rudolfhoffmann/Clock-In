import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalConsentPage } from './modal-consent.page';

const routes: Routes = [
  {
    path: '',
    component: ModalConsentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalConsentPageRoutingModule {}
