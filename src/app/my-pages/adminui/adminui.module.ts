import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminuiPageRoutingModule } from './adminui-routing.module';

import { AdminuiPage } from './adminui.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminuiPageRoutingModule
  ],
  declarations: [AdminuiPage]
})
export class AdminuiPageModule {}
