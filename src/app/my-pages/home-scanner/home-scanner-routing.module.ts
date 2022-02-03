import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeScannerPage } from './home-scanner.page';

const routes: Routes = [
  {
    path: '',
    component: HomeScannerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeScannerPageRoutingModule {}
