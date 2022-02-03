/*
  Use Firebase Documentation: https://firebase.google.com/docs/database/web/start
*/


/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';

import { LocalStorageService } from '../../my-services/local-storage.service';

import { environment } from 'src/environments/environment';

import { getDatabase, set, ref, push, onValue, get, query, limitToLast, equalTo, orderByChild, child } from '@firebase/database';

import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';
import { Device } from '@capacitor/device';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  // ----- Member Variable -----
  /* Not used since Version 0.1.1 */
  employees: string[] = [];
  /* Not used since Version 0.1.1 */
  comments: string = '';
  timestamp: any;

  // Don't specify the structure of the elements in the checkins-list, in order to be more flexible.
  statusHistory: any = {checkins: []};

  historyVisual: {
    checkin: string;
    date: string;
    time: string;
    comments: string;
    content: string;
  }[] = [];



  // !!!!! Here are the members listed, that are also used in the recent version. !!!!!
  // Flag that determine, if the current qr-code is already checked in.
  isCheckedIn: boolean = false;

  realtimeDB: any;
  dbRef: any;  // Reference to nodes of database.
  pushDbRef: any;  // Reference with auto-generated id, that is based on timestamp.

  qrcode: string = '';

  qrcodeValid: boolean;
  feedback = 'Status ladet...';
  qrcontent = '';
  qrcontentVis = '';

  // Store in this list all QR-Codes, that are currently checked in.
  lastCheckins = [];
  timestampsOfLastCheckins = [];
  timestampVis = [];

  customerBranch: string;
  uuid: string;

  hideGrid = true;


  isTestRun = false;
  time = '8:0';  // Time for test purposes.


  constructor(
    private actRoute: ActivatedRoute,
    private storageService: LocalStorageService,
    private navCtrl: NavController,
    private globalFunctions: GlobalFunctionsService,
    private zone: NgZone,
    private plt: Platform,
  ) { }


  async ngOnInit() {
    await this.plt.ready();  // Wait until platform is loaded completely.
    this.uuid = (await Device.getId()).uuid;
    this.customerBranch = await this.storageService.get('customerBranch');  // Fetch customerBranch stored in local storage after login.
    this.realtimeDB = getDatabase();
    this.dbRef = ref(this.realtimeDB, this.customerBranch + '/' + environment.dbDevicesBranch + '/' + this.uuid + '/checkins');
    this.pushDbRef = push(this.dbRef);

    this.actRoute.queryParams.subscribe(params => {
      const qrcode = params.qrcode;
      this.isTestRun = params.isTestRun;
      this.time = params.time;

      this.qrcodeValid = this.validateQRCode(qrcode);

      if(this.qrcodeValid) {
        // Send check-in information to server (employees, comments, check-in/out, timestamp).
        this.qrcode = qrcode;
        this.qrcontent = this.globalFunctions.getContentFromQRCode(this.qrcode);
        this.sendCheckinInformation();
      } else {
        this.feedback = 'Fehler beim Anmelden der Arbeitszeit';
      }
    });

    // Read from real time database.
    /*onValue(this.dbRef, (snapshot) => {
      const data = snapshot.val();
      const checkins = data.checkins;
      checkins.forEach(status => {
        // Determine checkin.
        const checkinVis: string = this.globalFunctions.getCheckinVis(status.checkin);


        // Determine date and time.
        const dateVis: string = this.globalFunctions.getDateVis(status.timestamp);
        const timeVis: string = this.globalFunctions.getTimeVis(status.timestamp);

        // Determine employees.
        const employeesVis: string = this.globalFunctions.getEmployeeVis(status.employees);

        // Determine customer and address from qrcode.
        const customerVis = this.globalFunctions.getCustomerFromQRCode(this.qrcode);
        const addressVis = this.globalFunctions.getAddressFromQRCode(this.qrcode);


        this.historyVisual.push({checkin: checkinVis, date: dateVis, time: timeVis, employees: employeesVis,
          customer: customerVis, address: addressVis, comments: this.comments});
      });
    });*/
  }


  async sendCheckinInformation() {
    // Not used since version 0.1.3
    //const successStatus = await this.readStatusHistory();
    // Not used since version 0.1.1
    //const successEmployee = await this.readEmployees();
    const successLastCheckin = await this.readLastCheckins();
    const successComments = await this.readComments();



    if(successLastCheckin && successComments) {
      const status = this.createStatus();

      // Not used since version 0.1.3
      // Send to server and if successfull, append to history.
      //this.statusHistory.checkins.push(status);


      // Send to server and if successful, set corresponding feedback and set checked-in QR-code to local storage or remove
      // checked-out QR-code from local storage.
      set(this.pushDbRef, status).then(() => {
        // Force view to be updated.
        this.zone.run(() => {
          this.qrcontentVis = 'QR-Code: ' + this.qrcontent;
        if(status.checkin===true) {
          this.feedback = 'Clock-In';
        } else {
          this.feedback = 'Clock-Out';
        }
        });

        // Force view to be updated.
        this.zone.run(() => {
          // If QR-code is already checked-in, remove it from list.
          if(this.isCheckedIn) {
            const index = this.lastCheckins.indexOf(this.qrcontent, 0);
            if(index > -1) {
              this.lastCheckins.splice(index, 1);
              this.timestampsOfLastCheckins.splice(index, 1);
            }
          }
          // If not already checked-in, add it to list.
          else {
            this.lastCheckins.push(this.qrcontent);
            this.timestampsOfLastCheckins.push(this.timestamp);
            // Determine date and time.
            this.timestampVis = this.globalFunctions.visualizeTimestamps(this.timestampsOfLastCheckins);

          }
        });

        // Update the list in the local storage.
        this.storageService.set('lastCheckins', this.lastCheckins);
        this.storageService.set('timestampsOfLastCheckins', this.timestampsOfLastCheckins);


      }).catch(err => {
        alert(err);
      });
    }
  }


  createStatus() {
    let check_in: boolean = false;
    if(this.isCheckedIn===false) {
      check_in = true;
    }
    let date: Date;
    if(this.isTestRun) {
      date = new Date('2022/01/03');
      const hours = this.time.split(':')[0];
      const minutes = this.time.split(':')[1];
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
    } else {
      date = new Date();
    }

    //let timestampString = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ';
    //timestampString += date.getHours() + ':' + date.getMinutes();
    /* Version 0.0.1
    const status = {
      checkin: check_in,
      timestamp: date.getTime(),
      employees: this.employees,
      comments: this.comments,
      customer: this.globalFunctions.getCustomerFromQRCode(this.qrcode),
      address: this.globalFunctions.getAddressFromQRCode(this.qrcode),
    };
    */
    /* Version 0.1.1 */



    this.timestamp = date.getTime();
    const status = {
      checkin: check_in,
      timestamp: this.timestamp,
      comments: this.comments,
      content: this.qrcontent,
    };

    return status;
  }


  validateQRCode(qrcode: string) {
    // This app contains a code in the QR-Code to authenticate that the QR-Code was generated from this app.
    // QR-Codes generated from other sources will not be processed.
    if(this.globalFunctions.getAuthFromQRCode(qrcode)===environment.qrAuth) {
      return true;
    } else {
      alert('QR-Code ungülitg');
      return false;
    }
  }


  async readLastCheckins() {
    // Determine this.isCheckedIn of current QR-Code by reading the recent check-ins.
    // All QR-Codes that are check-in (true) are stored in a list in the local storage. If the corresponding QR-code is checked-out again,
    // then this QR-code is removed from the list stored in the local storage. This enables to check-in multiple QR-Codes,
    // e.g. check-in for arriving in the office, then check-in for arriving at the working place and later check it all out again.
    const json = await this.storageService.get('lastCheckins');  // Read list of checked-in QR-codes.
    const jsonTimestamps = await this.storageService.get('timestampsOfLastCheckins');  // Read list of timestamps from checked-in QR-codes.
    // If content of current QR-code is not available, then this returns -1. Otherwise, index of element is returned.
    let index = -1;
    if(json !== undefined && json !== null) {
      this.lastCheckins = json;
      index = this.lastCheckins.indexOf(this.qrcontent, 0);
      // If no last checkins available (), then hide grid.
      if(this.lastCheckins.length === 0) {
        this.hideGrid = true;
      } else {
        this.hideGrid = false;
      }

      if(jsonTimestamps !== undefined && jsonTimestamps !== null) {
        this.zone.run(() => {
          this.timestampsOfLastCheckins = jsonTimestamps;
          this.timestampVis = this.globalFunctions.visualizeTimestamps(this.timestampsOfLastCheckins);
        });
      }
    }
    if(index > -1) {
      this.isCheckedIn = true;
    }


    const successPromise = new Promise((resolve, reject) => {
      resolve(true);
      reject(false);
    });

    return successPromise;
  }


  // Read possible comments for the checkin.
  async readComments() {
    const comments: string = await this.storageService.get('employee_comments');
    if(comments === undefined) {
      this.comments = '';
    } else {
      this.comments = comments;
    }


    const successPromise = new Promise((resolve, reject) => {
      resolve(true);
      reject(false);
    });

    return successPromise;
  }


  navigate2Employee() {
    this.navCtrl.navigateForward('/clockinui');
  }





  // Not used since version 0.1.3
  // Since version 0.1.3, information is not stored in local storage anymore. A more efficient query from firebase is used instead.
  // Read status history and determine last scanning (check-in or check-out).
  async readStatusHistory() {
    // Local storage in JSON format.
    const json = await this.storageService.get('status_history');
    if(json!==undefined && json!==null) {
      this.statusHistory = json;
      const checkins = this.statusHistory.checkins;
      this.isCheckedIn = checkins[checkins.length - 1].checkin;
    }

    const successPromise = new Promise((resolve, reject) => {
      resolve(true);
      reject(false);
    });

    return successPromise;
  }
  // Not used since version 0.1.3


  // Not used since version 0.1.1
  // Read employee and possible comments for the checkin.
  async readEmployees() {
    const employee: string = await this.storageService.get('employee_names');
    const comments: string = await this.storageService.get('employee_comments');

    this.employees = employee.split(',');
    this.comments = comments;

    const successPromise = new Promise((resolve, reject) => {
      resolve(true);
      reject(false);
    });

    return successPromise;
  }
  // Not used since version 0.1.1


}
