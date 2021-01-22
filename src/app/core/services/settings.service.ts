import { Injectable } from '@angular/core';
import { Config } from './config';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public defaults = {
    aadtRange: { lower: 0, upper: 100000 },
    dataMode: 'paired',
  };

  constructor(private Cfg: Config) {
    this.Cfg.settings = this.defaults;
  }
}
