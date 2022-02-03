import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeSupervisorPageRoutingModule } from './home-supervisor-routing.module';

import { HomeSupervisorPage } from './home-supervisor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeSupervisorPageRoutingModule
  ],
  declarations: [HomeSupervisorPage]
})
export class HomeSupervisorPageModule {}
