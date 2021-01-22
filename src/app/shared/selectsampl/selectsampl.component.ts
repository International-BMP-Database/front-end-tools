import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { AbstractengineService } from 'src/app/core/services/abstractengine.service';
import * as _ from 'lodash';

/**
 * @title Table with filtering
 */
@Component({
  selector: 'app-selectsampl',
  templateUrl: './selectsampl.component.html',
  styleUrls: ['./selectsampl.component.scss'],
})
export class SelectsamplComponent implements OnInit {
  resultsLength = 0;

  pageTitle: 'Untitled Modal';
  payload = [];
  owner = 'UnknownService'; // owners must populate this, overwrite in open modals with parent component name
  // public engine: any;

  public tbl = {
    pageSize: 20,
    tblDataSource: new MatTableDataSource(this.payload), // inflated in constructor
    //  displayedColumns: ['dateCreated', 'userEntityName', 'parentSampleID', 'loggedBy']
    displayedColumns: ['dateCreated', 'userEntityName', 'parentSampleID']
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
    if (this.payload && this.payload.length) {
      this.payload = _.sortBy(this.payload, ['dateCreated']);
      this.tbl.tblDataSource = new MatTableDataSource(this.payload);
      this.resultsLength = this.payload.length;
    }
    return true;
  }

  tblRowClickH(row) {
    // alert('to do');
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
