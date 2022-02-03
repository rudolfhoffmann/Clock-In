import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalStatusHistoryPageRoutingModule } from './modal-status-history-routing.module';

import { ModalStatusHistoryPage } from './modal-status-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalStatusHistoryPageRoutingModule
  ],
  declarations: [ModalStatusHistoryPage]
})
export class ModalStatusHistoryPageModule {}
