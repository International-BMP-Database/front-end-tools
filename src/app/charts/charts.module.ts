import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { PlotlychartComponent } from './plotlychart/plotlychart.component';
import { ChartsService } from './charts.service';


PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [PlotlychartComponent],
  imports: [
    CommonModule,
    PlotlyModule,
  ],
  exports: [PlotlychartComponent],
  providers: [ChartsService]
})
export class ChartsModule { }
