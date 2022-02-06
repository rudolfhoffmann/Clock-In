import { Component, Input, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { AlertInfo, GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

@Component({
  selector: 'app-simple-input',
  templateUrl: './simple-input.component.html',
  styleUrls: ['./simple-input.component.scss'],
})
export class SimpleInputComponent implements OnInit {
  @Input() filename;
  @Input() header;
  @Input() message;
  @Input() exportRecords;

  nameValid = false;
  valFeedback = '';

  radioValue = 'json';


  constructor(
    private popoverCtrl: PopoverController,
    private globalFunctions: GlobalFunctionsService,
  ) { }

  ngOnInit() {
    this.validateName();
  }



  async cancel() {
    await this.popoverCtrl.dismiss();
  }

  async save() {
    const data = {
      filename: this.filename,
      format: this.radioValue,
    };

    if(this.filename===undefined || this.filename==='') {
      const alertInfo: AlertInfo = {
        header: 'Fehler',
        subHeader: '',
        message: 'Kein Dateiname angegen!',
      };
      this.globalFunctions.createInfoAlert(alertInfo, () => {});
    }
    else {
      await this.popoverCtrl.dismiss(data);
    }
  }


  validateName() {
    // Allow characters a through z, A through Z, 0 through 9, space, underscore.
    // ^: begin ; $: end ; +: 1 or more times.
    // Regular expression between / -> / regex /
    if(/^[a-zA-Z0-9 _]+$/.test(this.filename)) {
      this.nameValid = true;
      this.valFeedback = '';
    } else {
      this.nameValid = false ;
      this.valFeedback = 'Der Name enthält ungültige Zeichen!';
    }
  }

}
