import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StatsPage } from './stats.page';
import { GuassianService } from './guassian.service';
import { StatsService } from './stats.service';
import { GsstatsService } from './gsstats.service';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyIonicModule } from '@ngx-formly/ionic';
import { SharedModule } from '@shared/shared.module';
import { StatsformComponent } from './statsform/statsform.component';
import { ChartsModule } from 'src/app/charts/charts.module';


const routes: Routes = [
  {
    path: 'maplink_stats',
    component: StatsPage,
    data: { mode: 'deeplink' }
  }, {
    path: '',
    component: StatsPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyIonicModule,
    SharedModule,
    IonicModule,
    ChartsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StatsPage, StatsformComponent],
  providers: [
    GuassianService, StatsService, GsstatsService
  ]
})
export class StatsPageModule { }
