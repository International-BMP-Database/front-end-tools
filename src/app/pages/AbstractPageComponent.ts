
import { Config } from '../core/services/config';
import { Shared } from '../core/services/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ActionSheetController, ModalController, Events } from '@ionic/angular';
import * as _ from 'lodash';
import { GsButton, GsFormEvent, Entity } from '../core/services/models';
import { AbstractengineService } from '../core/services/abstractengine.service';
import { SelectentryComponent } from '../shared/selectentry/selectentry.component';
import { OverlayEventDetail } from '@ionic/core';
import { SelectwellinventComponent } from '@shared/selectwellinvent/selectwellinvent.component';

const COMPONENTNAME = 'Abstract Page';
const LOCATIONENTITYTYPE = 'location';
const FEATUREENTITYTYPE = 'feature';
const SAMPLESENTITYTYPE = 'SampleLog';
const DRINKWELLENTITYTYPE = 'WellInventoryLog';

export interface GsForm { value: any; valid: boolean; }

@Component({
  selector: 'app-abstractPage',
  template: '<div></div>',
})
export class AbstractPageComponent implements OnInit {
  public entityType = this.engine.entityType;
  public componentID = 'page_abstract'; // used to differentiate pub/sub events
  public pageTitle = 'Unknown Page Title';

  locationsForFeature = [];
  public config: any;
  public currentDateTime = moment().format('MMMM Do YYYY, h:mm a');

  public mobileSafariDateTimeFormat = 'YYYY-MM-DDTHH:mm:ss';
  // @ViewChild(Content) content: Content;
  dateTimeDisplayFormat = 'MMM DD, YYYY HH:mm';
  hasValidationErrors = false;
  validationMsgs = [];
  photos: Array<any> = [];

  photosFilterArgs = { deleted: false }; // used to omit soft deleted photos from display
  // public userName = 'unknownUser';
  public defaultInitialDateTimeVal: string = new Date().toISOString();
  public defaultMaxDateTimeVal = '' + (moment().year() + 1);
  public formOpts = {
    yesno: [
      'Yes', 'No'
    ],
    yesnona: [
      'Yes', 'No'
    ],
  };

  public mainForm: FormGroup;

  // child pages must overide
  public subforms: any = {
    main: {
      title: 'Unknown Title', icon: 'add', btnLabel: 'Add Unknown',
      comp: AbstractPageComponent,
      model: {},
      // tblDataSource: {}, // inflated in constructor
      data: [],
      displayedColumns: []
    },
  };
  public frmFromDB: any = {}; // this is the form that has been retrieved from the db if already exists or empty obj
  public submitAttempt = false;
  savedLogs = [];
  constructor(
    public frmEvents: Events, // listen for events from modal forms
    public engine: AbstractengineService,
    public Cfg: Config,
    public shared: Shared,
    public modalCtrl: ModalController
  ) {

    this.config = this.Cfg.appStrings;


  }

  ngOnInit() {
    this.currentDateTime = moment().format('MMMM Do YYYY, h:mm a');

  }
  public subToCommonEvents() {
    console.log('hi subToCommonEvents');
  }

  public unsubToCommonEvents(): void {
    console.log('hi unsubToCommonEvents');
  }

  // convenience getter for easy access to form fields
  get f() { return this.mainForm.controls; }
  currentDate(format = this.mobileSafariDateTimeFormat) {
    return moment().format(format);
  }

  goToHome() {
    this.shared.goHome();
  }

  cancelBtnH() {
    console.log('Form canceled');
    this.shared.goFeatHome();
  }


  public resetForms() {
    console.log('Child form must override resetForms');
  }

  public async closeModal() {
    try {
      // not every form opened in modal so use try-catch
      return await this.modalCtrl.dismiss();
    } catch (err) {
      console.log(err);
    }
  }

  private goToHomeOrFeatHome() {
    if (this.engine.usesDefaultFeature) {
      this.shared.goHome();
    } else {
      this.shared.goFeatHome();
    }
  }
  async handleSubformEvents(data: GsFormEvent) {
    console.log(`inside ${COMPONENTNAME}.handleSubformEvents data->`, data);

    return true;
  }

  async getSubforms(mainForm: Entity) {
    // loop through subforms and populate
    // overide in child forms
    console.log('Warning', 'Overide getSubforms in abstractPageComponent');
  }
  async openModal(comp: any, payload = null, parentModel = null, pageTitle = '', cssClass = 'gs-bigmodal') {
    const modal: HTMLIonModalElement =
      await this.modalCtrl.create({
        backdropDismiss: false,
        component: comp,
        cssClass,
        componentProps: {
          payload,
          parentModel,
          pageTitle,
          owner: this.componentID
        }
      });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      if (detail !== null) {
        console.log('The result:', detail.data);
      }
    });

    return await modal.present();

  }


  // must override in children
  public async submit(formlyFormModel, $evt = null) {
    console.log(formlyFormModel);
    const value = formlyFormModel;
    this.submitAttempt = true;

    if (value === undefined) {
      this.shared.presentAlert('Warning !', `Please check the form and fill out all reguired fields. Form not saved`);
      return false;
    }

    this.shared.presentAlert('Success !', 'Form saved successfully');
    console.log('Success - Form saved successfully called in AbstractPageComponent for -', this.componentID);
    return true;
  }

  isFrmFieldValid(field: string) {
    const fld = this.f[field];

    const debuglog = `
      name - ${field}
      field val - ${fld.value}
      touched - ${fld.touched}
      valid - ${fld.valid}
      submitted - ${this.submitAttempt}`;

    // console.log(debuglog);
    // NOTE do not delete touched condition always true on ios so workaround below
    // return ((fld.valid === false && fld.touched === true) || fld.untouched === true && this.submitAttempt === true);
    return (fld.valid === false && this.submitAttempt === true);
  }

  formchanges(data) {
    // console.log('Form changes', data);
  }

  cancelFormH() {
    this.shared.presentAlertConfirm('Abandon form and all changes?', () => {
      this.goToHomeOrFeatHome();
    }, () => console.log('Cancel op canceled', 'Confirm', ''));
  }


  public validateForm({ value, valid }: GsForm): boolean {
    return true; // children to implement rigorous validation
  }
  goToResetPassword() {

  }

}

