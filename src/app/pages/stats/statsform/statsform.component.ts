import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { SharedFields } from '@core/sharedfields';
import { FormFields } from './fields';
import * as _ from 'lodash';
import { Remotedata } from '@core/remotedata';
import { Subject, Observable, Subscription } from 'rxjs';
import { StatsService } from '../stats.service';
import { Shared } from '@core/shared';
import { SettingsService } from '@core/settings.service';
import { ActivatedRoute } from '@angular/router';
import { ImgmapComponent } from '@shared/imgmap/imgmap.component';


@Component({
  selector: 'app-statsform',
  templateUrl: './statsform.component.html',
  styleUrls: ['./statsform.component.scss'],
})
export class StatsformComponent implements AfterViewInit, OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();
  private sub$: Subscription;
  private prevFldsMemo: any = {};
  public openPanel = 0;
  public resultsLength = 0;
  public frmlyOptions: FormlyFormOptions = {};
  public form = new FormGroup({});
  public formFields: FormlyFieldConfig[];
  @Output() submitEvt = new EventEmitter();
  @Output() cancelBtnEvt = new EventEmitter();
  @Output() downloadEvt = new EventEmitter();
  @Output() resetBtnEvt = new EventEmitter();
  public recordCountLoading = false;

  public model: any = {};
  public dataMode = this.engine.DATAMODES.PAIRED;
  public owner: 'dot' | 'bmpdatabase' = 'dot';
  public isFromMapLink = false;
  // public prevParam: string = null; // used to show busy loading so can filter by param
  // public formOptions: SharedFields;
  constructor(
    private route: ActivatedRoute,
    private settingsSrvc: SettingsService,
    public shared: Shared,
    private dataSrvc: Remotedata,
    private engine: StatsService
  ) {

    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.owner = params && params.owner ? params.owner : 'dot';
    });

  }

  ngOnInit() {
    this.prepMainForm();
    this.shared.recordCount = null;
  }

  ngAfterViewInit() {
    this.prepMainForm();
    this.shared.recordCount = null;

    this.sub$ = this.route
      .data
      .subscribe(data => {
        console.log(data);
        if (data && data.mode === 'deeplink' && this.shared.selectedSite) {
          this.dataSrvc.announceBusyLoading(true);
          this.owner = this.shared.selectedSite.owner || 'dot';
          this.isFromMapLink = true;

          this.model = {
            ...this.model,
            pollutantCategory: this.shared.selectedSite.paramGroup || '',
            parameter: this.shared.selectedSite.param || '',
            bmpCategory: this.shared.selectedSite.category || '',
            aadt: this.settingsSrvc.defaults.aadtRange,
            dataMode: this.settingsSrvc.defaults.dataMode,
          };
          this.prepMainForm(); // update the form since coming from map or some other link so download will work
          // cue a microtask to submit the form
          setTimeout(() => {
            this.submit(this.model);
          }, 0);
        }
      });
  }

  ngOnDestroy() {
    this.sub$.unsubscribe();
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public setOpenPanel(panelIndex = 0) {
    this.openPanel = panelIndex;
  }
  public segmentChanged($event) {
    this.dataMode = $event;
    console.log($event);
  }

  private async prepMainForm() {
    // add defaults to the model
    // below not working for AADT

    this.formFields = new FormFields(this.dataSrvc, this.onDestroy$).selectionFormFields;
    this.formFields[4].templateOptions.onClick = ($event) => {
      this.EPARainZoneMapSelect($event); // bind event for epa rain zone map select
    };

    this.formFields[3].hide = this.owner === 'bmpdatabase';
    this.formFields[5].hide = this.owner === 'bmpdatabase';

    this.model = {
      ...this.model, aadt: this.settingsSrvc.defaults.aadtRange, dataMode: this.settingsSrvc.defaults.dataMode
    };
  }

  private async EPARainZoneMapSelect(event) {
    alert('test');
    this.shared.presentModal(ImgmapComponent, 'test');
  }

  public async formChanges(frm) {
    // @todo emit form values
    console.log(frm);
    if (frm && frm.parameter && frm.parameter !== '' && this.prevFldsMemo.parameter !== frm.parameter) {
      await this.shared.presentLoading(2000);
    }
    if (
      (this.prevFldsMemo.parameter !== frm.parameter) ||
      (frm.bmpCategory && this.prevFldsMemo.bmpCategory !== frm.bmpCategory) ||
      (frm.siteType && this.prevFldsMemo.siteType !== frm.siteType) ||
      (frm.epaRainZone && this.prevFldsMemo.epaRainZone !== frm.epaRainZone)) {

      // update site counts as needed
      if (frm.parameter) {
        this.shared.recordCount = null;
        this.recordCountLoading = true;
        // endpoint slow so dont wait  indicate busy in ui await this.shared.presentLoading();
        this.shared.recordCount = await this.dataSrvc.getRecordCounts(
          frm.parameter || null, frm.bmpCategory || null, frm.siteType || null, frm.epaRainZone || null);
        this.recordCountLoading = false;
        //  await this.shared.dismissLoading();
      }

    }
    this.prevFldsMemo = { ...frm };
  }

  public async submit(model = this.form.value) {
    console.log(model);
    this.submitEvt.emit({ ...model, dataMode: this.dataMode });
  }

  public cancelBtnH() {
    this.model = {};
    this.frmlyOptions.resetModel();
    this.cancelBtnEvt.emit('cancel');
  }

  public async resetBtnH() {
    this.model = {};
    this.frmlyOptions.resetModel();
    this.resetBtnEvt.emit({ ...this.form.value, dataMode: this.dataMode });
  }

  public async downloadData() {
    const payload = {
      ...this.model,
      bmpCategory: this.form.value.bmpCategory || this.model.bmpCategory,
      epaRainZone: this.form.value.epaRainZone || this.model.epaRainZone,
      pollutantCategory: this.form.value.pollutantCategory || this.model.pollutantCategory,
      siteType: this.form.value.siteType || this.model.siteType,
      isFromMapLink: this.isFromMapLink
    };

    console.log(payload);
    this.downloadEvt.emit({ ...payload, dataMode: this.dataMode });
  }


  public openHelpPage() {
    this.shared.openHelpPage();
  }

}
