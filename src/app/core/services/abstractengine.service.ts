import * as _ from 'lodash';
import { Subject } from 'rx';
import { Shared } from './shared';
import { Injectable } from '@angular/core';
import { GsFormEvent, Entity } from './models';
import { Events } from '@ionic/angular';

export interface GsForm {
  value: any;
  valid: boolean;
}

@Injectable()
export class AbstractengineService {
  public mergeEntityOnSync = false;
  usesDefaultFeature = false;
  wellNotRequired = true; // set to false in well dev, purgin and sampling, level measurement
  idRules = {
    hasFeatureID: true,
    hasLocationID: true,
  };
  dataChangeSubject = new Subject<any>();
  delim = '_';
  idFrag = 'abstractentity';
  entityType = 'abstractentity';
  hasMapables = false;
  defaultEntity = {
    entityType: this.entityType,
  };

  allLogsInDb = []; // metadata for all logs in db
  logs: Entity[] = []; // stores form submissions
  selectedLog: any;
  visits = [];
  container = {
    entityType: this.entityType,
    logs: this.logs,
  };
  msgs = {
    entrySaveFail: 'Abstract entry save failed',
    entrySaveSucc: 'Abstract entry saved successfully',
    entryDeleteFail: 'Item delete failed',
    entryDeleteSucc: 'Item deleted successfully',
  };

  eventTypes = {
    frmEvent: { label: 'frmEvent' },
    itmSelect: { label: 'itmSelect' },
    itmEdit: { label: 'itmEdit' },
    closeModal: { label: 'closeModal' },
  };
  data = this.logs;
  defaultMapSymbol = 'geosyntec';
  CURRENTYEAR = new Date().getFullYear();
  subLogEntityType = 'NoSubLog'; // replace this in child classes

  constructor(public evts: Events, public shared: Shared) {
    console.log('Hello from AbstractengineService');
  }

  broadCastFormEvent(data: GsFormEvent) {
    console.log(
      `About to broad cast form event ${data.owner}frmEvent_${data.type}_${data.senderID}`,
      data
    );
    this.evts.publish(`${data.owner}frmEvent_${data.type}_${data.senderID}`, data);
  }
  broadCastGenericEvent(data: GsFormEvent, eventType = 'itmSelect') {
    // const pub = new Events();
    console.log(`About to broad cast generic event ${data.owner}${eventType}`, data);
    this.evts.publish(data.owner + eventType, data);
  }

  pad(num: number | string, desiredWidth: number, charToPadWith: string = '0') {
    const numStr = num + '';
    return numStr.length >= desiredWidth
      ? numStr
      : new Array(desiredWidth - numStr.length + 1).join(charToPadWith) + numStr;
  }

  objEnsureOrConvertToBoolean(obj: any, keys: string[], defaultVal: boolean = false) {
    keys.map((key) => {
      obj[key] = this.ensureOrConvertToBoolean(obj[key] || defaultVal);
    });
  }
  ensureOrConvertToBoolean(val: any) {
    if (typeof val === 'boolean') {
      return val;
    }

    switch ('' + val.toLowerCase().trim()) {
      case 'true':
      case 'yes':
      case '1':
        return true;
      case 'false':
      case 'no':
      case '0':
      case null:
        return false;
      default:
        return Boolean(val);
    }
  }

  public createMainFrmModel(): any {
    // overide in child forms
    console.log('Warning', 'Overide createMainFrmModel in abstractPageComponent');

    return {};
  }

  // childern must override
  validateAnyForm(frm: any, parentFrm: {}) {
    return false;
  }

  dpRound(val, decimalPlaces) {
    const exp = Math.pow(10, decimalPlaces);
    let rslt = Math.round(val * exp) / exp;
    if (Math.abs(rslt) === 0) {
      rslt = Math.abs(rslt);
    }
    return rslt;
  }
}
