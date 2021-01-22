import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-plotlychart',
  templateUrl: './plotlychart.component.html',
  styleUrls: ['./plotlychart.component.scss'],
})
export class PlotlychartComponent implements OnInit {

  // @Input() dataSource: any;
  /*@Input() payload = {
    data: [{ x: [1, 2, 3], y: [2, 5, 3], type: 'bar' }],
    layout: { autosize: true, title: 'A Fancy Plot' },
  };*/
  @Input() graph = {
    traces: [{ x: [1, 2, 3], y: [2, 5, 3], type: 'bar' }],
    layout: { autosize: true, title: 'A Fancy Plot' },
  };
  constructor() { }

  ngOnInit() {
    console.log('iniside PlotlyChartComponent payload', this.graph);
  }
}
