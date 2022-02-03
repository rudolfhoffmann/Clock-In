/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';

import { getDatabase, ref, update } from 'firebase/database';

import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../../my-services/local-storage.service';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';


@Component({
  selector: 'app-clockinui',
  templateUrl: './clockinui.page.html',
  styleUrls: ['./clockinui.page.scss'],
})
export class ClockinuiPage implements OnInit {
  // ----- Member Variables -----
  hideGrid = true;


  comments: string;

  // Store in this list all QR-Codes, that are currently checked in.
  lastCheckins = [];
  timestampsOfLastCheckins = [];
  timestampVis = [];


  subCancelledSubscription;

  customerBranch;
  realtimeDB: any;
  refDBConfig;

  constructor(
    private storageService: LocalStorageService,
    private navCtrl: NavController,
    private globalFunctions: GlobalFunctionsService,
    private zone: NgZone,
  ) { }

  async ngOnInit() {
    this. customerBranch = await this.storageService.get('customerBranch');  // Fetch customerBranch stored in local storage after login.
    this.realtimeDB = getDatabase();
    this.refDBConfig = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbConfigBranch);
  }

  ionViewDidEnter() {
    this.getComments();

    this.readLastCheckins();
  }


  ionViewDidLeave() {
    // Unsubscribe subscribted/observed BehaviourSubjects, in order to avoid multiple subscriptions.
    this.subCancelledSubscription.unsubscribe();
  }


  async readLastCheckins() {
    const json = await this.storageService.get('lastCheckins');  // Read list of checked-in QR-codes.
    const jsonTimestamps = await this.storageService.get('timestampsOfLastCheckins');  // Read list of timestamps from checked-in QR-codes.
    // If content of current QR-code is not available, then this returns -1. Otherwise, index of element is returned.
    if(json !== undefined && json !== null) {
      this.zone.run(() => {
        this.lastCheckins = json;
        // If no last checkins available (), then hide grid.
        if(this.lastCheckins.length === 0) {
          this.hideGrid = true;
        } else {
          this.hideGrid = false;
        }

        if(jsonTimestamps !== undefined && jsonTimestamps !== null) {
          this.timestampsOfLastCheckins = jsonTimestamps;
          this.timestampVis = this.globalFunctions.visualizeTimestamps(this.timestampsOfLastCheckins);
        }
      });
    }
  }


  async getComments() {
    this.comments = await this.storageService.get('employee_comments');
  }



  async openScanner() {
    await this.storageService.set('employee_comments', this.comments);
    this.navCtrl.navigateForward('/scanner');
  }


  async infoPopover(ev) {
    const information = 'Hier können Sie weitere Information angeben, die mit dem Inhalt des QR-Codes übertragen wird.';
    this.globalFunctions.informationPopover(information, ev);
  }





}
