import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalRegistrationPage } from './modal-registration.page';

const routes: Routes = [
  {
    path: '',
    component: ModalRegistrationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalRegistrationPageRoutingModule {}
