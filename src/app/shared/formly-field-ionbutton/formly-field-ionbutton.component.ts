import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-ionbutton',
  templateUrl: './formly-field-ionbutton.component.html',
  styleUrls: ['./formly-field-ionbutton.component.scss'],
})
export class FormlyFieldIonbuttonComponent extends FieldType {

  onClick($event) {
    if (this.to.onClick) {
      this.to.onClick($event);
    }
  }

}
