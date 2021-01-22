

import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { GsButton } from 'src/app/core/services/models';
import * as _ from 'lodash';

@Component({
  selector: 'app-maptaskbar',
  templateUrl: './maptaskbar.component.html',
  styleUrls: ['./maptaskbar.component.scss'],
})
export class MaptaskbarComponent implements OnInit {
  @Output() btnClickEvt = new EventEmitter();
  // @Input() btnVisibility = {}; // format {'feat-info':true} can be sparse
  @Input() payload = {
    followMode: false,
    showTrackingButtons: false,
    transectInProgress: false,
    utilLocateMode: false
  };
  public actions: Array<GsButton> = [
    { idx: 'find-feature', label: 'Find Feature', icon: 'locate', show: true, iconSlot: 'start', showText: true },
    { idx: 'show-hide-legend', label: 'Show/Hide Legend', icon: 'list', show: true, iconSlot: 'start', showText: true },
    { idx: 'show-hide-layers', label: 'Show/Hide Layers', icon: 'logo-buffer', show: true, iconSlot: 'start', showText: true },
  ];

  showTrackingButtons = true;
  transectInProgress = true;
  constructor() { }

  ngOnInit() {
    this.updateButtonVisibility(this.payload);
  }

  public updateButtonVisibility(payload) {
    this.showTrackingButtons = payload && payload.showTrackingButtons;
    this.transectInProgress = payload && payload.transectInProgress;

  }

  showHideLegendOnMap() {
    const action = _.find(this.actions, { idx: 'show-hide-legend' });
    this.btnClickEvt.emit(action);
  }
  showMapLayersModal() {
    const action = _.find(this.actions, { idx: 'show-hide-layers' });
    this.btnClickEvt.emit(action);
  }

  selectFeatureHandler() {
    const action = _.find(this.actions, { idx: 'find-feature' });
    this.btnClickEvt.emit(action);
  }

}

