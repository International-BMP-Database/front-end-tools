import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { MapService } from '../map.service';

@Component({
  selector: 'app-maplegend',
  templateUrl: './maplegend.component.html',
  styleUrls: ['./maplegend.component.scss'],
})
export class MaplegendComponent implements OnInit, AfterViewInit {
  pageTitle = 'Toggle Layer Visibility';
  @Input() payload = {
    layers: []
  };

  @Input() bmpSites;

  public bmpSiteCounts: any;

  @Output() actionEvt = new EventEmitter();

  constructor(public engine: MapService) { }

  ngOnInit() {
    // get bmp category type counts
    this.refreshBMPSiteCounts();
  }

  async ngAfterViewInit() { }

  private getCountsByField(objArr: any[], key: string) {
    if (!objArr || objArr.length < 1) { return {}; }

    return objArr.reduce((accumDict, obj) => {
      if (!accumDict.hasOwnProperty(obj[key])) {
        accumDict[obj[key]] = 0;
      }
      accumDict[obj[key]]++;
      return accumDict;
    }, {});

  }

  public refreshBMPSiteCounts(sites = this.bmpSites) {
    this.bmpSiteCounts = this.getCountsByField(sites, 'category');
  }



}

