import { Component, Input, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { GlobalFunctionsService } from 'src/app/my-services/global-functions.service';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss'],
})
export class UsernameComponent implements OnInit {
  // ----- Member Variables -----
  @Input() usernameType: number;
  @Input() heading: string;
  @Input() message: string;
  @Input() username: string;

  formGroup: FormGroup;



  constructor(
    private popoverCtrl: PopoverController,
    private globalFunctions: GlobalFunctionsService,
    private formBuilder: FormBuilder,  // Object to handle form validation.
  ) {
  }

  ngOnInit() {
    // @Input() is in constructor undefined, since it is not initalized yet.
    if(this.usernameType === this.globalFunctions.TYPE_USERNAME.username ||
        this.usernameType === this.globalFunctions.TYPE_USERNAME.accountname ||
        this.usernameType === this.globalFunctions.TYPE_USERNAME.accountpassword) {
      this.formGroup = this.formBuilder.group({
        // Define validations.
        usernameCtrl: ['', Validators.compose([
          Validators.minLength(1), Validators.maxLength(20), Validators.required,
        ])],
      });
    }
    else if(this.usernameType === this.globalFunctions.TYPE_USERNAME.email) {
      this.formGroup = this.formBuilder.group({
        // Define validations.
        usernameCtrl: ['', Validators.compose([
          Validators.minLength(1), Validators.maxLength(30), Validators.required, Validators.email,
        ])],
      });
    }

    this.formGroup.setValue({
      usernameCtrl: this.username,
    });
  }


  async save() {
    this.username = this.formGroup.get('usernameCtrl').value;
    const data = {
      username: this.username,
    };

    if(this.username===undefined || this.username==='') {
      alert('Keine Bezeichnung angegeben.');
    } else {
      await this.popoverCtrl.dismiss(data);
    }
  }

}
