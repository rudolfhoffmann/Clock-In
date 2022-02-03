import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(
    private storage: Storage,
    private navCtrl: NavController,
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }


  public async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  public async get(key: string) {
    return await this.storage.get(key);
  }

  public async remove(key: string) {
    await this.storage.remove(key);
  }

  public async clear() {
    await this.storage.clear();
  }

  public async getKeys() {
    return await this.storage.keys();
  }


  public async logout(pageurl, navigationExtra) {
    // On logout, clear all data in storage. Just remember consent property.
    const consented = this.get('consented');
    this.clear();
    this.set('consented', consented);
    this.navCtrl.navigateRoot(pageurl, navigationExtra);
  }
}
