import { Component, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-action-menu-admin',
  templateUrl: './action-menu-admin.component.html',
  styleUrls: ['./action-menu-admin.component.scss'],
})
export class ActionMenuAdminComponent implements OnInit {

  actionlist: any;


  constructor(
    private popoverCtrl: PopoverController,
  ) { }

  ngOnInit() {
    this.actionlist = [
      {
        title: 'Aufzeichnung öffnen',
        hint: '',
        icon: 'open-outline',
        action: 0,
      },
      {
        title: 'Benutzername umbenennen',
        hint: '',
        icon: 'pencil-outline',
        action: 1,
      },
      {
        title: 'Daten exportieren',
        hint: 'Exportieren Sie die erfassten Aufzeichnungen des jeweiligen Geräts.',
        icon: 'arrow-redo-outline',
        action: 4,  // Not ordered, since this action was later added.
      },
      {
        title: 'Gerät blockieren',
        hint: 'Blockierte Geräte können die App nicht benutzen. Die blockierten Geräte können in den Einstellungen verwaltet werden.',
        icon: 'open-outline',
        action: 2,
      },
      {
        title: 'Benutzer löschen',
        hint: 'Der Benutzer sowie alle erfassten Zeiten des Benutzers werden entgültig gelöscht.',
        icon: 'trash-outline',
        action: 3,
      },
    ];
  }

  closeActionMenu(code) {
    const data = {
      action: code,
    };
    this.popoverCtrl.dismiss(data);
  }


}
