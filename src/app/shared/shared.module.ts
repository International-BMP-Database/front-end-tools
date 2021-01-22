import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GsbigbuttonComponent } from './gsbigbutton/gsbigbutton.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatButtonToggleModule, MatInputModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule,
  MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatExpansionModule, MatAutocompleteModule,
} from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { FocuserDirective } from './directives/focuser.directive';
import { FieldErrorDisplayComponent } from './field-error-display/field-error-display.component';
import { FormtaskbarComponent } from './formtaskbar/formtaskbar.component';
import { SelectentryComponent } from './selectentry/selectentry.component';
import { MaptaskbarComponent } from './maptaskbar/maptaskbar.component';
import { SelectsamplComponent } from './selectsampl/selectsampl.component';
import { SelectbyidComponent } from './selectbyid/selectbyid.component';
import { SelectwellinventComponent } from './selectwellinvent/selectwellinvent.component';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyFieldDualrangeComponent } from './formly-field-dualrange/formly-field-dualrange.component';
import { FormlyFieldIonbuttonComponent } from './formly-field-ionbutton/formly-field-ionbutton.component';
import { ImgmapComponent } from './imgmap/imgmap.component';
import { FormlyFieldGsselectComponent } from './formly-field-gsselect/formly-field-gsselect.component';
import { FormlySelectModule } from '@ngx-formly/core/select';

@NgModule({
  declarations: [
    FieldErrorDisplayComponent,
    FocuserDirective,
    FormtaskbarComponent,
    GsbigbuttonComponent, SelectentryComponent,
    MaptaskbarComponent,
    SelectsamplComponent,
    SelectbyidComponent,
    SelectwellinventComponent,
    FormlyFieldDualrangeComponent,
    FormlyFieldIonbuttonComponent,
    FormlyFieldGsselectComponent,
    ImgmapComponent,
  ],
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatProgressSpinnerModule, MatSortModule, MatTableModule,
    MatAutocompleteModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
      types: [
        { name: 'dualrange', component: FormlyFieldDualrangeComponent },
        { name: 'ionbutton', component: FormlyFieldIonbuttonComponent },
        { name: 'gsselect', component: FormlyFieldGsselectComponent },
      ]
    }),
    IonicModule,
    FormlyIonicModule,
    FormlySelectModule,
  ],
  exports: [
    FieldErrorDisplayComponent,
    FocuserDirective,
    FormtaskbarComponent,
    GsbigbuttonComponent, SelectentryComponent,
    MatExpansionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatAutocompleteModule,
    MaptaskbarComponent,
    SelectsamplComponent,
    SelectbyidComponent,
    SelectwellinventComponent,
    // FormlyFieldDualrangeComponent
    ImgmapComponent,
  ],
  entryComponents: [
    SelectentryComponent,
    SelectsamplComponent,
    SelectbyidComponent,
    SelectwellinventComponent,
    ImgmapComponent
    // FormlyFieldDualrangeComponent
  ]
})
export class SharedModule { }


