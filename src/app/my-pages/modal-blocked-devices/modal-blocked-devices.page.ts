import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-blocked-devices',
  templateUrl: './modal-blocked-devices.page.html',
  styleUrls: ['./modal-blocked-devices.page.scss'],
})
export class ModalBlockedDevicesPage implements OnInit {
  // ---- Member Variables -----
  @Input() blockedDevices: string[];

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }


  // Remove device from list of blocked devices.
  remove(index) {
    this.blockedDevices.splice(index, 1);
  }

  async closeModal() {
    const data = {
      blockedDevices: this.blockedDevices,
    };

    this.modalCtrl.dismiss(data);
  }

}
