// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,



  // ----- Customer Configuration -----
  // Reference to branch for customer
  //appUri: 'https://inno-apps.ddns.net/app/' + 'test/', //'idsrepp/' || 'test/',  --> for manual updates without App Stores

  // Not used from here anymore. These values are created chosing the abonnements during registration and then stored in the realtime DB.
  //dbCustomerBranch: 'Test', //'IDS_REPP_DB!' || 'Test',
  /*aboConfig: {
    activated: true,
    testVersion: false,
    expireDate: (new Date()).getTime() + 1000*3600*24*30,  // 30 days free usage for testing.
    numberUser: 8,
    dataHistory: 90,  // days to store the data.
    encrypt: false,
    registeredDevices: '',  // separate devices with :::
    blockedDevices: '',  // separate devices with :::
  },*/
  // ----- Customer Configuration -----
  qrAuth: 'ClockIn',
  clockinHttp: 'ClockInHttp',

  email: 'rudolf.hoffmann@inno-apps.de',
  emailpass: '4@3(bD)`f}sL%"YL)&oK',

  dbUsername: 'username',
  dbDevicesBranch: 'devices',
  dbConfigBranch: 'config',
  dbAdminEmail: 'adminEmail',
  dbAdminPassword: 'adminPassword',
  dbBranchPassword: 'branchPassword',
  dbRegEmailsBranch: 'registeredEmails',
  dbEmailBranch: 'email',
  dbEmailVerified: 'emailVerified',
  dbAccountEmailBranch: 'Account-Email',

  dbRegisteredDevices: 'registeredDevices',

  firebaseConfig: {
    apiKey: 'AIzaSyAlWi65_PkDzo-kA7LZq8ZH6rjYS6Gq2hY',
    authDomain: 'checkin-innoapps.firebaseapp.com',
    databaseURL: 'https://checkin-innoapps-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'checkin-innoapps',
    storageBucket: 'checkin-innoapps.appspot.com',
    messagingSenderId: '65083167549',
    appId: '1:65083167549:web:ee35b9b956f1c321daeb54'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
