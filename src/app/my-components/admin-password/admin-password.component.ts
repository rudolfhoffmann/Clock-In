import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, PopoverController } from '@ionic/angular';
import { ref, getDatabase, set, get, update } from '@firebase/database';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/my-services/local-storage.service';

@Component({
  selector: 'app-admin-password',
  templateUrl: './admin-password.component.html',
  styleUrls: ['./admin-password.component.scss'],
})
export class AdminPasswordComponent implements OnInit {
  // ----- Member Variables ------
  @Input() oldPassword;

  formGroup: FormGroup;

  password: string;

  realtimeDB;

  constructor(
    private popoverCtrl: PopoverController,
    private storageService: LocalStorageService,
    private formBuilder: FormBuilder,  // Object to handle form validation.
  ) {
    this.formGroup = this.formBuilder.group({
      // Define validations.
      oldPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      newPasswordCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
      newPasswordConfirmCtrl: ['', Validators.compose([
        Validators.minLength(1), Validators.maxLength(20), Validators.required,
      ])],
    });
  }

  ngOnInit() {
    this.realtimeDB = getDatabase();
  }


  // Validate, that passwords match.
  matchPassword() {
    const apw = this.formGroup.get('newPasswordCtrl').value;
    const acpw = this.formGroup.get('newPasswordConfirmCtrl').value;
    if(apw === acpw) {
      return true;
    }

    return false;
  }

  async save() {
    if(this.oldPassword !== this.formGroup.get('oldPasswordCtrl').value) {
      alert('Altes Passwort nicht korrekt.');
    }
    else if(!this.matchPassword()) {
      alert('Neue Passwörter stimmen nicht überein');
    }
    else {
      const newPassword = this.formGroup.get('newPasswordCtrl').value;

      const data = {
        adminPassword: newPassword,
      };

      this.closeModal(data);
    }
  }


  closeModal(data) {
    this.popoverCtrl.dismiss(data);
  }



}
