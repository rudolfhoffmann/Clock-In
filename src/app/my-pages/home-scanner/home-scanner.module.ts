import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeScannerPageRoutingModule } from './home-scanner-routing.module';

import { HomeScannerPage } from './home-scanner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HomeScannerPageRoutingModule
  ],
  declarations: [HomeScannerPage]
})
export class HomeScannerPageModule {}
