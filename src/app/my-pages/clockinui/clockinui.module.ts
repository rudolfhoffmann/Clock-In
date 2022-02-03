import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClockinuiPageRoutingModule } from './clockinui-routing.module';

import { ClockinuiPage } from './clockinui.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClockinuiPageRoutingModule
  ],
  declarations: [ClockinuiPage]
})
export class ClockinuiPageModule {}
