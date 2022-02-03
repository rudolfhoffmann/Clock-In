import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalStatusHistoryPage } from './modal-status-history.page';

const routes: Routes = [
  {
    path: '',
    component: ModalStatusHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalStatusHistoryPageRoutingModule {}
