import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminuiPage } from './adminui.page';

const routes: Routes = [
  {
    path: '',
    component: AdminuiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminuiPageRoutingModule {}
