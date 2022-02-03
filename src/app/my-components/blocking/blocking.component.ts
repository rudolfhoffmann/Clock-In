import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-blocking',
  templateUrl: './blocking.component.html',
  styleUrls: ['./blocking.component.scss'],
})
export class BlockingComponent implements OnInit {

  @Input() blockingcode;

  title: string;
  content: string;

  constructor() { }

  ngOnInit() {
    if(this.blockingcode === 0) {
      this.title = 'Aktivierung der App erforderlich!';
      this.content = 'Ihre App ist nicht aktiviert. Nehmen Sie für die Aktivierung Kontakt auf mit info@inno-apps.de.';
    }
    else if(this.blockingcode === 1) {
      this.title = 'Test-Version abgelaufen!';
      this.content = 'Ihre Test-Version ist abgelaufen. Nehmen Sie für die Aktivierung Kontakt auf mit info@inno-apps.de.';
    }
    else if(this.blockingcode === 2) {
      this.title = 'Maximale Anzahl der Geräte überschritten!';
      this.content = 'Sie haben die maximale Anzahl zulässiger Geräte überschritten. ';
      this.content += 'Nehmen Sie für die Aktivierung Kontakt auf mit info@inno-apps.de.';
    }
    else if(this.blockingcode === 3) {
      this.title = 'Gerät blockiert!';
      this.content = 'Das Gerät wurde vom Administrator blockiert. ';
      this.content += 'Nehmen Sie Kontakt mit dem Administrator auf, um die Blockierung aufzuheben.';
    }
  }

}
