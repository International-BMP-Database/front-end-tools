import { Injectable } from '@angular/core';
import Feature from 'ol/Feature.js';
import { Tile as TileLayer, Vector as VectorLayer, Group as GroupedLayers } from 'ol/layer.js';
// import 'rxjs/add/operator/map';

export class PlotData {
  allData: PairedData[];
  maxpt: number;
  minpt: number;

  inflowDates: Date[];
  inflowValues: number[];
  inflowNDValues: number[];
  inflowNDDates: Date[];
  inflowPairedValues: number[];

  outflowDates: Date[];
  outflowValues: number[];
  outflowNDValues: number[];
  outflowNDDates: number[];
  outflowPairedValues: number[];

  ndInflOnlyInfl: number[];
  ndInflOnlyEffl: number[];
  ndEfflOnlyInfl: number[];
  ndEfflOnlyEffl: number[];
  ndBothInfl: number[];
  ndBothEffl: number[];

  // for quantile plots
  influentParams: any;
  effluentParams: any;
  // end quantile plots
  unit: string;
  query: StatsQuery;
}

export class PlotDataAll {
  allData: PairedData[];
  maxpt: number;
  minpt: number;
  inflowDates: Date[];
  inflowValues: number[];
  inflowNDValues: number[];
  inflowNDDates: Date[];
  // inflowPairedValues: number[];

  outflowDates: Date[];
  outflowValues: number[];
  outflowNDValues: number[];
  outflowNDDates: number[];

  // for quantile plots
  influentParams: any;
  effluentParams: any;
  // end quantile plots
  unit: string;
  query: StatsQuery;
}

export class StatsQuery {
  aadt: any = {};
  disableAADT: any;
  bmpCategory: string[];
  pollutantCategory: string[];
  parameter: string;
  siteType: string[];
  dataMode: 'paired' | 'flat';
  epaRainZone: number[];
}

export class PairedData {
  category: string;
  epazone: number;
  state: string;
  site: string;
  bmp: string;
  storm: number;
  watertype: string;
  paramgroup: string;
  units: string;
  parameter: string;
  fraction: string;
  initialscreen: string;
  wqscreen: string;
  catscreen: string;
  balanced: string;
  bmptype: string;
  res_inflow: number;
  res_outflow: number;
  date: Date;
  aadt: number;
}

export class AlertObj {
  title: string;
  subtitle: string;
  message?: string;
}
export class EventLabel {
  id: string;
  code: string;
}
export class Entity {
  _id?: string = null; // used by pouchdb
  id: string = null;
  entityType: string = null;
  label: string = null;
  isDefault = false;
  dateCreated: Date;
  notes: string;

  constructor(isDefault: boolean = false) {
    this.isDefault = isDefault;
    if (isDefault) {
      this._id = `default_${this.entityType}`;
    }
  }
}

export interface GsButton {
  idx: string;
  label: string;
  icon: string;
  show: boolean;
  iconSlot: string;
  showText: boolean;
}

export interface GsFormEvent {
  type: 'Submit' | 'Cancel' | 'Select' | 'Close-modal' | 'Delete' | 'Edit';
  data?: any;
  senderID: string;
  owner: string;
  isSubform?: boolean;
}

export interface GsMapEvent {
  type: 'Legend-Show' | 'Legend-Hide' | 'Layers-Toggle' | 'Close-modal';
  data?: any;
  senderID: string;
}
