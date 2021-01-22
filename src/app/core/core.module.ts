import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Shared } from './services/shared';
import { Config } from './services/config';
import { Remotedata } from './services/remotedata';
import { AbstractengineService } from './services/abstractengine.service';
import { ExcelService } from '@core/excel.service';
import { SettingsService } from '@core/settings.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, IonicModule],
  providers: [Shared, Config, Remotedata, AbstractengineService, ExcelService, SettingsService],
  exports: [],
})
export class CoreModule {}
