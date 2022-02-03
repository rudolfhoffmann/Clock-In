import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeSupervisorPage } from './home-supervisor.page';

const routes: Routes = [
  {
    path: '',
    component: HomeSupervisorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeSupervisorPageRoutingModule {}
