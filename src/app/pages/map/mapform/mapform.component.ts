import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { FormFields } from './fields';
import * as _ from 'lodash';
import { Remotedata } from '@core/remotedata';
import { Subject } from 'rxjs';
import { StatsService } from '../../stats/stats.service';
import { Shared } from '@core/shared';
import { SettingsService } from '@core/settings.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mapform',
  templateUrl: './mapform.component.html',
  styleUrls: ['./mapform.component.scss'],
})
export class MapformComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();
  public openPanel = 0;
  public resultsLength = 0;
  public frmlyOptions: FormlyFormOptions = {};
  public form = new FormGroup({});
  public formFields: FormlyFieldConfig[];
  @Output() submitEvt = new EventEmitter();
  @Output() cancelBtnEvt = new EventEmitter();
  @Output() resetBtnEvt = new EventEmitter();
  @Output() downloadEvt = new EventEmitter();

  public model: any = {};
  public dataMode = this.engine.DATAMODES.PAIRED;
  public owner: 'dot' | 'bmpdatabase' = 'dot';
  constructor(
    private route: ActivatedRoute,
    private settingsSrvc: SettingsService,
    private shared: Shared,
    private dataSrvc: Remotedata,
    private engine: StatsService
  ) {
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      this.owner = params && params.owner ? params.owner : 'dot';
    });
  }

  ngOnInit() {
    this.prepMainForm();
  }
  ngOnDestroy() {
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
    this.formFields = new FormFields(this.dataSrvc, this.onDestroy$).selectionFormFields;
    this.formFields[3].hide = this.owner === 'bmpdatabase';
  }

  public formChanges($event) {
    console.log($event);
  }

  public async submit() {
    console.log(this.form.value);
    await this.shared.presentLoading();
    this.submitEvt.emit({ ...this.form.value, dataMode: this.dataMode });
  }

  public cancelBtnH() {
    this.frmlyOptions.resetModel();
    this.cancelBtnEvt.emit('cancel');
  }

  public async resetBtnH() {
    this.frmlyOptions.resetModel();
    await this.shared.presentLoading();
    this.resetBtnEvt.emit({ ...this.form.value, dataMode: this.dataMode });
  }

  public async downloadData() {
    console.log(this.form.value);
    await this.shared.presentLoading();
    this.downloadEvt.emit({ ...this.form.value, dataMode: this.dataMode });
  }

  public openHelpPage() {
    this.shared.openHelpPage();
  }
}
