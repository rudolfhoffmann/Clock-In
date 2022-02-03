import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClockinuiPage } from './clockinui.page';

const routes: Routes = [
  {
    path: '',
    component: ClockinuiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClockinuiPageRoutingModule {}
