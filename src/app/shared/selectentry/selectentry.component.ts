import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { AbstractengineService } from 'src/app/core/services/abstractengine.service';
import { Entity } from '@core/models';

/**
 * @title Table with filtering
 */
@Component({
  selector: 'app-selectentry',
  templateUrl: './selectentry.component.html',
  styleUrls: ['./selectentry.component.scss'],
})
export class SelectentryComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  resultsLength = 0;

  pageTitle: 'Untitled Modal';
  payload = [];
  owner = 'UnknownService'; // owners must populate this, overwrite in open modals with parent component name
  // public engine: any;

  public tbl = {
    pageSize: 20,
    tblDataSource: new MatTableDataSource(this.payload), // inflated in constructor
    // displayedColumns: ['actionsColumn', 'dateCreated', 'userEntityName', 'loggedBy', 'icons']
    displayedColumns: ['actionsColumn', 'dateCreated', 'userEntityName', 'icons']
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
    this.tbl.tblDataSource = new MatTableDataSource(this.payload);
    this.resultsLength = this.payload.length;
    this.tbl.tblDataSource.sort = this.sort;
    return true;
  }
  async ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    // this.tbl.tblDataSource.sort = this.sort;

    // this.tbl.tblDataSource = new MatTableDataSource(data);
    this.tbl.tblDataSource.paginator = this.paginator;
    this.tbl.tblDataSource.sort = this.sort;
  }

  tblRowClickH(row) {
    // alert('to do');
    this.engine.broadCastGenericEvent({
      type: 'Select', data: row, senderID: 'SelectEntryComponent', owner: this.owner
    });
  }

  editEntity(row: Entity) {
    this.engine.broadCastGenericEvent({
      type: 'Edit',
      data: row,
      senderID: 'SelectEntryComponent',
      owner: this.owner
    }, 'itmEdit');
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
