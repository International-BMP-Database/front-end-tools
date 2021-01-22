
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { AbstractengineService } from 'src/app/core/services/abstractengine.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-selectwellinvent',
  templateUrl: './selectwellinvent.component.html',
  styleUrls: ['./selectwellinvent.component.scss'],
})
export class SelectwellinventComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  resultsLength: number;

  pageTitle: 'Untitled Modal';
  payload = [];
  owner = 'UnknownService'; // owners must populate this, overwrite in open modals with parent component name

  public tbl = {
    pageSize: 20,
    tblDataSource: new MatTableDataSource([]), // inflated in constructor
    displayedColumns: ['wellID', 'installDate', 'wellOwner']
  };

  // dataSource = new MatTableDataSource(this.payload);

  constructor(public engine: AbstractengineService) {
    console.log('inside SelectentryComponent payload');
  }

  applyFilter(filterValue: string) {
    this.tbl.tblDataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    console.log('inside SelectentryComponent payload', this);
    this.payload = _.sortBy(this.payload, ['wellID']);
    this.resultsLength = this.payload.length;
    this.tbl.tblDataSource = new MatTableDataSource(this.payload);
    return true;
  }

  async ngAfterViewInit() {

    this.tbl.tblDataSource.paginator = this.paginator;
  }

  tblRowClickH(row) {
    this.engine.broadCastGenericEvent({
      type: 'Select', data: row, senderID: 'SelectEntryComponent', owner: this.owner
    });
  }

  closeModal() {
    this.engine.broadCastGenericEvent({
      type: 'Close-modal',
      data: {},
      senderID: 'SelectEntryComponent',
      owner: this.owner
    }, 'closeModal');
  }
}

