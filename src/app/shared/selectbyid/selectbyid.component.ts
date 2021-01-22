import { AbstractengineService } from 'src/app/core/services/abstractengine.service';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';

const COMPONENTNAME = 'SelectByIDComponent';

/**
 * @title Table with filtering
 */
@Component({
  selector: 'app-selectbyid',
  templateUrl: './selectbyid.component.html',
  styleUrls: ['./selectbyid.component.scss'],
})
export class SelectbyidComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  resultsLength = 0;

  pageTitle: 'Untitled Modal';
  payload = [];
  owner = 'UnknownService'; // owners must populate this, overwrite in open modals with parent component name

  public tbl = {
    pageSize: 20,
    tblDataSource: new MatTableDataSource([]), // inflated in constructor
    displayedColumns: ['id']
  };

  constructor(public engine: AbstractengineService) {
    console.log(`inside ${COMPONENTNAME} payload`);
  }

  applyFilter(filterValue: string) {
    this.tbl.tblDataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    console.log(`inside ${COMPONENTNAME} payload`, this);

    this.createTable(this.payload);
  }

  public async ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.tbl.tblDataSource.paginator = this.paginator;
  }
  async createTable(rows) {
    const data = _.sortBy(rows, ['id']);
    if (data && data.length && data.length > 0) {
      this.tbl.tblDataSource = new MatTableDataSource(data);
      this.tbl.tblDataSource.paginator = this.paginator;
      this.resultsLength = data.length;
      return true;
    }
    return false;
  }

  public tblRowClickH(row) {
    console.log(row);
    this.engine.broadCastGenericEvent({
      type: 'Select', data: row, senderID: COMPONENTNAME, owner: this.owner
    });
  }

  public closeModal() {
    this.engine.broadCastGenericEvent({
      type: 'Close-modal',
      data: {},
      senderID: COMPONENTNAME,
      owner: this.owner
    }, 'closeModal');
  }
}
