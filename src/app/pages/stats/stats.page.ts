
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Remotedata } from '@core/remotedata';
import { StatsService } from './stats.service';
import { ChartsService } from 'src/app/charts/charts.service';
import { Shared } from '@core/shared';
import { ExcelService } from '@core/excel.service';
import { Config } from '@core/config';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const DEFAULTPAGESIZE = 10;


@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements AfterViewInit, OnInit, OnDestroy {
  mode: 'normal' | 'deeplink' = 'normal'; // set to deeplink when coming from the map popup
  pageTitle = 'Data Query & Statistical Analysis Tool';

  public hypoTable = [];
  public basicStats = [];
  public chartsInfo = {
    traces: null,
    layout: null,
    modebar: null
  };

  public tbls: any = {
    basicStats: {
      title: 'Basic Stats',
      btnLabel: 'Download',
      displayedColumns: ['statistic', 'influent', 'effluent', 'comparison'],
      // tblDataSource: new MatTableDataSource([]),
      data: [],
      downloadableData: [],
      pageSize: DEFAULTPAGESIZE,
    },
  };

  public isFromMapLink = false;
  private sub$: Subscription;
  constructor(
    private route: ActivatedRoute,
    public Cfg: Config,
    private shared: Shared,
    private dataSrvc: Remotedata,
    private engine: StatsService,
    private chartSrvc: ChartsService,
    private xl: ExcelService,
  ) {
    console.log('Hello Stats Page');
  }

  ngOnInit() {
    this.dataSrvc.busyStatus.subscribe((val: boolean) => {
      if (val === true) {
        this.shared.presentLoading();
      } else {
        this.shared.dismissLoading();
      }
    });
  }


  ngAfterViewInit() {

    this.sub$ = this.route.data.subscribe(data => {
      console.log(data);
      if (data && data.mode === 'deeplink' && this.shared.selectedSite) {
        this.isFromMapLink = true;
      }
    });
  }

  ngOnDestroy() {
    this.sub$.unsubscribe();
  }

  public async downloadH($event: any) {
    await this.shared.presentLoading(0, 'Loading...');
    const colHeaders = {};
    colHeaders[this.engine.DATAMODES.PAIRED] = this.getPairedDataDownloadReadableColNames();
    colHeaders[this.engine.DATAMODES.ALLDATA] = this.getAllDataDownloadReadableColNames();

    const data = await this.engine.getDownloadData($event);
    const fileTitle = $event && $event.dataMode &&
      $event.dataMode === this.engine.DATAMODES.PAIRED ? 'Paired_data_only' : 'All_data';
    const payload = $event && $event.dataMode &&
      $event.dataMode === this.engine.DATAMODES.PAIRED ? data.pairedFiltered : data.allDataFiltered;
    if (payload && payload.length) {
      this.xl.exportAsExcelFile([...colHeaders[$event.dataMode].fields, ...payload], fileTitle, colHeaders[$event.dataMode].dataDict);
    } else {
      this.shared.presentAlert('Warning', `The query parameters you set returned no data.
       Reset the query to download all the data or submit a less restrictive query`);
    }
    await this.shared.dismissLoading();
  }

  public async querySubmitH($event: any) {
    // await this.shared.presentLoading();
    this.dataSrvc.announceBusyLoading(true);
    // reset stats
    this.tbls.basicStats.data.length = 0;

    $event.siteType = $event.siteType ? $event.siteType : undefined;
    const temp = await this.engine.processQuery($event);
    // reset selected site for case where we arrived here from a map query
    this.shared.selectedSite = null;

    if (temp && temp.status && temp.status.code === 200) {
      const results = temp.processedData;
      if (results.basicStats) {
        this.tbls.basicStats.data = results.basicStats;
        this.tbls.basicStats.status = results.status.basicStats;
      }
      if (results.pairedPlotData && results.allPlotData) {
        const plotInfo = this.chartSrvc.makePlotlyPlots(results.pairedPlotData, results.allPlotData);
        this.chartsInfo = { ...plotInfo };

        // compute hypothesis test table
        const hypo = this.engine.computeHypothesisTests(results.pairedPlotData, results.allPlotData);
        this.hypoTable = [
          hypo.mannWhitney, hypo.wilcoxon, hypo.tTest, hypo.tTestLog
        ];
      }
    } else {
      this.shared.presentAlert('Warning', `${temp.status.errors.join('. ')}`);
    }
    this.dataSrvc.announceBusyLoading(true);
    // await this.shared.dismissLoading();
  }

  public queryCancelH($event) {
    this.tbls.basicStats.data.length = 0;
    this.chartsInfo.traces.length = 0;
  }

  public queryResetH($event) {
    this.tbls.basicStats.data.length = 0;
    this.chartsInfo.traces.length = 0;
  }

  public openHelpPage() {
    this.shared.openHelpPage();
  }

  public getPairedDataDownloadReadableColNames() {
    const fields = [{
      rec: 'Database Record Number', category: 'BMP Category', epazone: 'EPA Rain Zone',
      state: 'State or Provence', site: 'Site Name', bmp: 'BMP Name', storm: 'BMP Storm Event Numnber',
      watertype: 'Sampling Media', paramgroup: 'Parameter Group', units: 'Units of Measure',
      parameter: 'Parameter Name', fraction: 'Sampling Fraction', initialscreen: 'Study is Approved for Analysis',
      wqscreen: 'Record is Approved for Analysis', catscreen: 'BMP Category is Approved for Analysis',
      bmptype: 'BMP Category Abbreviation', ws_id: 'Watershed ID Number',
      site_id: 'Site ID Number', bmp_id: 'Bmp ID Number', dot_type: 'DOT Activity near BMP',
      sampletype: 'Stormwater Sampling Method', qual_inflow: 'Qualifier of Influent Result',
      qual_outflow: 'Qualifier of Effluent Result', res_inflow: 'Influent Result', res_outflow: 'Effluent Result',
      sampledatetime: 'Sample Collection Date and Time', pair: 'Summary of Influent & Effluent Qualifiers',
      aadt: 'Average Annual Daily Traffic', SSMA_TimeStamp: 'Database Record Timestamp'
    }];
    const dataDict = [{
      longName: 'Long Name',
      definition: 'Definition'
    },
    {
      longName: 'Database Record Number',
      definition: 'The row number of the record in the backend database table. Can be safely ignored.'
    },
    {
      longName: 'BMP Category',
      definition: 'The top-level BMP category (e.g., Bioretention, Detention Basin)'
    },
    {
      longName: 'EPA Rain Zone',
      definition: 'The US EPA Rain zone as defined by the National Stormwater Quality Database (http://unix.eng.ua.edu/~rpitt/Research/ms4/Paper/Mainms4paper.html). Sites outside the US are assigned -99'
    },
    {
      longName: 'State or Provence',
      definition: 'The US state in which the BMP exists. Populated with '
    },
    {
      longName: 'Site Name',
      definition: 'The name of site in where the BMP can be found (sites can have multiple BMPs).'
    },
    {
      longName: 'BMP Name',
      definition: 'The name of the BMP at the site where the observations were collected.'
    },
    {
      longName: 'BMP Storm Event Numnber',
      definition: 'The sequential number of the BMP\'s storm event during which the row\'s observations were collected.'
    },
    {
      longName: 'Sampling Media',
      definition: 'In the database, there are multiple watertypes (e.g., Surface/Runoff, Groundwater). '
    },
    {
      longName: 'Parameter Group',
      definition: 'E.g., Solids, Metals. The high-level grouping for the parameter (i.e., analyte) of the observation.'
    },
    {
      longName: 'Units of Measure',
      definition: 'Units of measure of the observation (e.g., mg/L, MPN/100 mL)'
    },
    {
      longName: 'Parameter Name',
      definition: 'The name of the parameter (i.e., analyte) observed (e.g., Dissolved Cadmium)'
    },
    {
      longName: 'Sampling Fraction',
      definition: 'The sampling fraction of the observation (e.g., Total, Dissolved)'
    },
    {
      longName: 'Study is Approved for Analysis',
      definition: 'Field used by the Database Team to mark the BMP study to be included in the web tool. Can be safely ignored.'
    },
    {
      longName: 'Record is Approved for Analysis',
      definition: 'Field used by the Database Team to mark the observation to be included in the web tool. Can be safely ignored.'
    },
    {
      longName: 'BMP Category is Approved for Analysis',
      definition: 'Field used by the Database Team to mark the BMP Category to be included in the web tool. Can be safely ignored.'
    },
    {
      longName: 'BMP Category Abbreviation',
      definition: 'Two-letter abbreviation of the BMP Category'
    },
    {
      longName: 'Watershed ID Number',
      definition: 'Unique numeric identifier of the watershed that drains into the BMP'
    },
    {
      longName: 'Site ID Number',
      definition: 'Unique numeric identifier of the Site that contains the BMP'
    },
    {
      longName: 'Bmp ID Number',
      definition: 'Unique numeric identifier of the BMP'
    },
    {
      longName: 'DOT Activity near BMP',
      definition: 'Broad classification of the type of DOT activity (if any) that influences the BMP'
    },
    {
      longName: 'Stormwater Sampling Method',
      definition: 'The stormwater sampling collection method of the observation (e.g., Composite, Grab)'
    },
    {
      longName: 'Qualifier of Influent Result',
      definition: 'The result qualifier of the numeric result of the influent observation ('
    },
    {
      longName: 'Qualifier of Effluent Result',
      definition: 'The result qualifier of the numeric result of the effluent observation ('
    },
    {
      longName: 'Influent Result',
      definition: 'The numeric result of the influent observation (typically concentration)'
    },
    {
      longName: 'Effluent Result',
      definition: 'The numeric result of the effluent observation (typically concentration)'
    },
    {
      longName: 'Sample Collection Date and Time',
      definition: 'The date and time at which the first of the influent/effluent observations was collected.'
    },
    {
      longName: 'Summary of Influent & Effluent Qualifiers',
      definition: 'A column summarizing the status of the qual_inflow and qual_outflow columns, for the purposes of symbolizing the data pairs in the scatter plots.'
    },
    {
      longName: 'Average Annual Daily Traffic',
      definition: 'The Average Annual Daily Traffic at the site where the observation was collected.'
    },
    {
      longName: 'Database Record Timestamp',
      definition: 'The binary timestamp at which the record was added to the database. Can be safely ignored.'
    }];
    return { fields, dataDict };
  }
  public getAllDataDownloadReadableColNames() {
    const fields = [
      {
        rec: 'Database Record Number', category: 'BMP Category', epazone: 'EPA Rain Zone',
        state: 'State or Provence', site: 'Site Name', bmp: 'BMP Name', storm: 'BMP Storm Event Numnber',
        paramgroup: 'Parameter Group', units: 'Units of Measure', parameter: 'Parameter Name',
        fraction: 'Sampling Fraction', initialscreen: 'Study is Approved for Analysis',
        wqscreen: 'Record is Approved for Analysis', catscreen: 'BMP Category is Approved for Analysis',
        bmptype: 'BMP Category Abbreviation', ws_id: 'Watershed ID Number', site_id: 'Site ID Number',
        bmp_id: 'Bmp ID Number', dot_type: 'DOT Activity near BMP', date: 'Sample Collection Date',
        sampletype: 'Stormwater Sampling Method', station: 'Monitoring station of BMP',
        qual: 'Result Qualifier', value: 'Numeric Result', aadt: 'Average Annual Daily Traffic',
        SSMA_TimeStamp: 'Database Record Timestamp'
      }];
    const dataDict = [{
      longName: 'Long Name',
      definition: 'Definition'
    },
    {
      longName: 'Database Record Number',
      definition: 'Database Record Number'
    },
    {
      longName: 'BMP Category',
      definition: 'BMP Category'
    },
    {
      longName: 'EPA Rain Zone',
      definition: 'EPA Rain Zone'
    },
    {
      longName: 'State or Provence',
      definition: 'State or Provence'
    },
    {
      longName: 'Site Name',
      definition: 'Site Name'
    },
    {
      longName: 'BMP Name',
      definition: 'BMP Name'
    },
    {
      longName: 'BMP Storm Event Numnber',
      definition: 'BMP Storm Event Numnber'
    },
    {
      longName: 'Parameter Group',
      definition: 'Parameter Group'
    },
    {
      longName: 'Units of Measure',
      definition: 'Units of Measure'
    },
    {
      longName: 'Parameter Name',
      definition: 'Parameter Name'
    },
    {
      longName: 'Sampling Fraction',
      definition: 'Sampling Fraction'
    },
    {
      longName: 'Study is Approved for Analysis',
      definition: 'Study is Approved for Analysis'
    },
    {
      longName: 'Record is Approved for Analysis',
      definition: 'Record is Approved for Analysis'
    },
    {
      longName: 'BMP Category is Approved for Analysis',
      definition: 'BMP Category is Approved for Analysis'
    },
    {
      longName: 'BMP Category Abbreviation',
      definition: 'BMP Category Abbreviation'
    },
    {
      longName: 'Watershed ID Number',
      definition: 'Watershed ID Number'
    },
    {
      longName: 'Site ID Number',
      definition: 'Site ID Number'
    },
    {
      longName: 'Bmp ID Number',
      definition: 'Bmp ID Number'
    },
    {
      longName: 'DOT Activity near BMP',
      definition: 'DOT Activity near BMP'
    },
    {
      longName: 'Sample Collection Date',
      definition: 'The date at which the first of the observations was collected.'
    },
    {
      longName: 'Stormwater Sampling Method',
      definition: 'Stormwater Sampling Method'
    },
    {
      longName: 'Monitoring station of BMP',
      definition: 'This column provides the inflow/outflow designation for the monitoring station of the BMP at which the observation was collected'
    },
    {
      longName: 'Result Qualifier',
      definition: 'The result qualifier of the numeric result of the observation ('
    },
    {
      longName: 'Numeric Result',
      definition: 'The numeric result of the observation (typically concentration)'
    },
    {
      longName: 'Average Annual Daily Traffic',
      definition: 'Average Annual Daily Traffic'
    },
    {
      longName: 'Database Record Timestamp',
      definition: 'Database Record Timestamp'
    }];
    return { fields, dataDict };
  }
}
