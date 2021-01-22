import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import _ from 'lodash';
import { Config } from './config';
import { Shared } from './shared';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment.prod';

const MOCKMODE = false;
const EPARAINZONES = [
  { zone: 'All', label: 'All' },
  { zone: 1, label: 'I' },
  { zone: 2, label: 'II' },
  { zone: 3, label: 'III' },
  { zone: 4, label: 'IV' },
  { zone: 5, label: 'V' },
  { zone: 6, label: 'VI' },
  { zone: 7, label: 'VII' },
  { zone: 8, label: 'VIII' },
  { zone: 9, label: 'IX' },
];

@Injectable({
  providedIn: 'root',
})
export class Remotedata {
  public ENDPOINTS = {
    BMPTYPES: 'vBMPCodes',
    BMPSITES: 'vBMPLocations',
    PARAMETERS: 'vParameters',
    POLLUTANTTYPES: 'vParameters', // get all pollutants and categorize clientside
    MAPDATA: 'mapdata',
    PAIREDDATA: 'WQPairs',
    NONPAIREDDATA: 'WQObs',
    EPARAINZONES: 'EPARainZone',
    SETTINGS: 'settings',
    SITETYPES: 'SiteTypes',
    WQOBS: 'WQRecords',
    WQPAIRS: 'WQPairs',
  };

  public busyStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public apikey = environment.apiKey;
  public apibaseurl = Config.APPINFO.isDebug
    ? Config.APPINFO.apiEndpoint_dev
    : Config.APPINFO.apiEndpoint_prod;
  private mockData = {};
  private httpOptions: any;
  private token: string; // api access token saved by authservice

  public formData = {
    aadt: { low: 0, high: 900 },
    dropDowns: {
      bmpTypes: { data: [], endpoint: this.ENDPOINTS.BMPTYPES, categories: [], types: [] },
      pollutantTypes: {
        data: [],
        endpoint: this.ENDPOINTS.POLLUTANTTYPES,
        categories: [],
        types: [],
      },
      epazones: { data: EPARAINZONES, endpoint: 'na', categories: EPARAINZONES, types: [] },
      siteTypes: { data: [], endpoint: this.ENDPOINTS.SITETYPES, categories: [], types: [] },
    },
  };
  constructor(
    private shared: Shared,
    private Cfg: Config,
    public http: HttpClient,
    private config: Config
  ) {
    console.log('Hello Remotedata Provider');

    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apikey,
    });

    this.httpOptions = {
      headers: myHeaders,
    };

    // @TODO: for dev only comment out for prod
    if (MOCKMODE) {
      this.prepMockData();
    }
    this.fetchFormMetaData();
  }

  public announceBusyLoading(value: boolean = true) {
    this.busyStatus.next(value);
  }

  public async showEPARainZoneSelect() {
    alert('clicked');
  }

  // fetches data for populating drop downs from API
  public async getCatDropDownOpts(key: string) {
    this.announceBusyLoading(true);
    console.log(`geting ${key} dropdown options`);
    if (
      this.formData &&
      this.formData.dropDowns &&
      this.formData.dropDowns[key] &&
      this.formData.dropDowns[key].data &&
      this.formData.dropDowns[key].data.length
    ) {
      this.announceBusyLoading(false);
      return this.formData.dropDowns[key].categories;
    }
    await this.fetchFormMetaData();
    this.announceBusyLoading(false);
    return this.formData.dropDowns[key].categories;
  }

  public async getParametersForCategories(key: string, selectedCategories: string[]) {
    const rslts = [];
    if (selectedCategories && selectedCategories.length) {
      const url = `${this.apibaseurl}${this.ENDPOINTS.PARAMETERS}`;
      const proms = selectedCategories.map(async (category) =>
        this.getDataFromRemoteServer(url, { category }).toPromise()
      );
      const resp = await Promise.all(proms);
      if (resp && resp.length) {
        this.flatten(resp, rslts);
        console.log(rslts);
        await this.shared.dismissLoading();
        return rslts;
      }
    }
    // await this.shared.dismissLoading();
    return [];
  }

  public async getBMPSites() {
    return this.get(this.ENDPOINTS.BMPSITES);
  }

  public getRecordCounts(
    paramName: string,
    bmpCat: string = 'any',
    siteType: string[] = [],
    rainZone: number[] = []
  ) {
    const opts: any = {
      bmp_category: bmpCat || 'any',
      site_type: siteType && siteType.length ? siteType : 'any',
      show_counts: true,
    };
    // @TODO update backend api to not require param for now always require param
    if (paramName) {
      opts.param_name = paramName;
      if (rainZone && rainZone.length) {
        opts.rain_zone = rainZone;
      }
    }

    const url = `${this.apibaseurl}${this.ENDPOINTS.WQOBS}`;
    return this.getDataFromRemoteServer(url, opts).toPromise();
  }

  public async getBMPTypesByParam(param: string) {
    const url = `${this.apibaseurl}${this.ENDPOINTS.BMPTYPES}?param_name=${param}`;
    return this.getDataFromRemoteServer(url).toPromise();
  }
  public async getSiteTypesByParam(param: string) {
    const url = `${this.apibaseurl}${this.ENDPOINTS.SITETYPES}?param_name=${param}`;
    return this.getDataFromRemoteServer(url).toPromise();
  }

  public async getRainZonesByParam(param: string) {
    const url = `${this.apibaseurl}${this.ENDPOINTS.EPARAINZONES}?param_name=${param}`;
    return this.getDataFromRemoteServer(url).toPromise();
  }

  public async getSitesByParam(param: string) {
    const url = `${this.apibaseurl}${this.ENDPOINTS.BMPSITES}?param_name=${param}`;
    return this.getDataFromRemoteServer(url).toPromise();
  }
  async getPopupContent(bmpID: string) {
    const url = `${this.apibaseurl}${this.ENDPOINTS.BMPSITES}?bmp_id=${bmpID}`;
    return this.getDataFromRemoteServer(url).toPromise();
  }

  /*public async getWQDatax(
    mode = 'paired', paramName: string, bmpCat: string = 'any',
    siteType: string = 'any', rainZone: number = 0, minAADT = 0, maxAADT = 100000) {

    const opts = {
      param_name: paramName,
      bmp_category: bmpCat,
      site_type: siteType,
      rain_zone: rainZone,
      // min_aadt: minAADT,
      // max_aadt: maxAADT,
    };
    const url = mode === 'paired' ? `${this.apibaseurl}${this.ENDPOINTS.WQPAIRS}` : `${this.apibaseurl}${this.ENDPOINTS.WQOBS}`;
    const rslts = this.getDataFromRemoteServer(url, opts).toPromise();
    return rslts;
  }*/

  public getWQData(
    mode = 'paired',
    paramName: string,
    bmpCat: any = 'any',
    siteType: string[] = [],
    rainZone: number[] = [],
    minAADT = 0,
    maxAADT = 100000
  ) {
    const opts: any = {
      param_name: paramName || 'any',
      bmp_category: bmpCat || 'any',
      site_type: siteType && siteType.length ? siteType : 'any',
      rain_zone: rainZone && rainZone.length ? rainZone : 'any',
    };

    const url =
      mode === 'paired'
        ? `${this.apibaseurl}${this.ENDPOINTS.WQPAIRS}`
        : `${this.apibaseurl}${this.ENDPOINTS.WQOBS}`;
    const rslts = this.getDataFromRemoteServer(url, opts).toPromise();
    return rslts;
  }

  private flatten(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
      const value = arr[i];
      if (Array.isArray(value)) {
        this.flatten(value, result);
      } else {
        result.push(value);
      }
    }
    return result;
  }

  public async getTypeForCategory(key: string, selectedCategory: string[]) {
    await this.fetchFormMetaData();
    // handle multiple selections
    if (selectedCategory && selectedCategory.length) {
      const results = [];
      selectedCategory.map((itm) => {
        const filtered = _.filter(this.formData.dropDowns[key].data, { category: itm });
        if (filtered && filtered.length) {
          const data = _.uniqBy(filtered, 'value');
          // return data;
          results.push(...data);
        }
      });
      return _.sortBy(results, ['value']);
    }
    return [];
  }

  public async fetchFilteredFormMetaData(
    key: string,
    param: string,
    bmpCode: string = null,
    siteType: string = null
  ) {
    if (key === 'bmpTypes') {
      const bmps = await this.getBMPTypesByParam(param);
      if (bmps && bmps.length) {
        this.formData.dropDowns.bmpTypes.data = bmps;
        this.formData.dropDowns.bmpTypes.categories = [
          { category: 'All', value: 'AL', priority: -1 },
          ...bmps,
        ];
        return _.sortBy(this.formData.dropDowns.bmpTypes.categories, ['value']);
      }
    } else if (key === 'siteTypes') {
      const siteTypes = await this.getSiteTypesByParam(param);
      if (siteTypes && siteTypes.length) {
        this.formData.dropDowns.siteTypes.data = siteTypes;
        this.formData.dropDowns.siteTypes.categories = [
          { label: 'All', category: 'All', value: 'AL', priority: -1 },
          ...siteTypes.map((itm) => {
            return { label: itm, category: itm, value: itm, priority: 0 };
          }),
        ];
        return _.sortBy(this.formData.dropDowns.siteTypes.categories, ['value']);
      }
    } else if (key === 'epazones') {
      let epazones = await this.getRainZonesByParam(param);
      epazones = epazones && epazones.length ? epazones.filter((itm) => itm > 0) : [];
      if (epazones && epazones.length) {
        this.formData.dropDowns.epazones.data = ['All', ...epazones];
        this.formData.dropDowns.epazones.categories = [
          { zone: 'All', category: 'All', value: -1, priority: -1 },
          ...epazones.map((itm) => {
            return { zone: itm, category: itm, value: itm, priority: 0 };
          }),
        ];
        return _.sortBy(this.formData.dropDowns.epazones.categories, ['value']);
      }
    }
    return [];
  }

  private async fetchFormMetaData() {
    // check if already fetched
    if (
      !this.formData ||
      !this.formData.dropDowns ||
      !this.formData.dropDowns.bmpTypes ||
      !this.formData.dropDowns.bmpTypes.data ||
      !this.formData.dropDowns.bmpTypes.data.length
    ) {
      const bmps = await this.get(this.ENDPOINTS.BMPTYPES);
      if (bmps && bmps.length) {
        this.formData.dropDowns.bmpTypes.data = bmps;
        // this.formData.dropDowns.bmpTypes.categories = _.uniqBy(bmps, 'category');
        this.formData.dropDowns.bmpTypes.categories = [
          { category: 'All', value: 'AL', priority: -1 },
          ..._.uniqBy(bmps, 'category'),
        ];
      }
      const polls = await this.get(this.ENDPOINTS.POLLUTANTTYPES);
      if (polls && polls.length) {
        this.formData.dropDowns.pollutantTypes.data = polls;
        this.formData.dropDowns.pollutantTypes.categories = _.uniqBy(polls, 'category');
      }

      // get site types
      const siteTypes = await this.get(this.ENDPOINTS.SITETYPES);
      if (siteTypes && siteTypes.length) {
        const temp = [{ label: 'All', category: 'All', value: 'AL', priority: -1 }];
        siteTypes.map((itm) => temp.push({ label: itm, category: itm, value: itm, priority: -1 }));
        this.formData.dropDowns.siteTypes.data = temp;
        this.formData.dropDowns.siteTypes.categories = temp;
      }
    }
    // console.log(this.formData.dropDowns);
    return this.formData;
  }

  public async get(endpoint: string) {
    let url = '';

    switch (endpoint) {
      case this.ENDPOINTS.BMPTYPES:
      case 'bmptypes':
        url = `${this.apibaseurl}${this.ENDPOINTS.BMPTYPES}`;
        break;
      case this.ENDPOINTS.BMPSITES:
      case 'vBMPLocations':
        url = `${this.apibaseurl}${this.ENDPOINTS.BMPSITES}`;
        break;

      case this.ENDPOINTS.WQOBS:
      case 'wqobs':
        url = `${this.apibaseurl}${this.ENDPOINTS.WQOBS}`;
        break;

      case this.ENDPOINTS.SITETYPES:
      case 'sitetypes':
        url = `${this.apibaseurl}${this.ENDPOINTS.SITETYPES}`;
        break;

      case this.ENDPOINTS.POLLUTANTTYPES:
      case 'pollutantTypes':
        url = `${this.apibaseurl}${this.ENDPOINTS.POLLUTANTTYPES}`;
        break;

      case this.ENDPOINTS.MAPDATA:
      case 'mapdata':
        url = `${this.apibaseurl}${this.ENDPOINTS.MAPDATA}`;
        break;

      case this.ENDPOINTS.NONPAIREDDATA:
      case 'flat':
      case 'nonpaireddata':
        url = `${this.apibaseurl}${this.ENDPOINTS.NONPAIREDDATA}`;
        break;

      case this.ENDPOINTS.PAIREDDATA:
      case 'paired':
      case 'paireddata':
        url = `${this.apibaseurl}${this.ENDPOINTS.PAIREDDATA}`;
        break;

      default:
        console.log('An error occured in get entity unknown->', endpoint);
    }

    // if (MOCKMODE || endpoint === this.ENDPOINTS.POLLUTANTTYPES ||
    //  endpoint === this.ENDPOINTS.BMPTYPES || endpoint === this.ENDPOINTS.SITETYPES) {
    if (MOCKMODE) {
      await this.prepMockData();
      return this.mockData[endpoint];
    }
    const data = await this.getDataFromRemoteServer(url).toPromise();
    return data;
  }

  // fetch local json
  private getLocalGeojson(fileNamePath: string) {
    return this.http.get(fileNamePath).pipe(
      tap((itm: any) => {
        // do any needed transformation here
        // console.log(itm);
      })
    );
  }

  private postDataToRemoteServerJSONP(payload, url = this.apibaseurl, callback = 'callback') {
    let fullUrl = `${url}?`;
    _.map(payload, (itm, key) => {
      fullUrl = `${fullUrl}${key}=${itm}&`;
    });
    fullUrl = fullUrl + 'dummy=dummy';
    return this.http.jsonp(fullUrl, callback).pipe(tap((response: Response) => console.log));
  }

  private getDataFromRemoteServer(url = this.apibaseurl, payload = {}): Observable<any> {
    const token = this.token || this.apikey;
    this.httpOptions.params = payload;
    return this.http.get(`${url}`, this.httpOptions);
  }

  private postDataToRemoteServer(payload, url = this.apibaseurl) {
    this.httpOptions.params = payload;
    return this.http.post(url, payload, this.httpOptions);
  }

  private formatSiteTypeOpts(data) {
    return data.map((x) => {
      return { label: x, value: x };
    });
  }

  private async prepMockData() {
    // return cached data if already read in
    if (this.mockData && this.mockData[this.ENDPOINTS.BMPTYPES] !== undefined) {
      return this.mockData;
    }

    const mockDataDir = 'assets/data/mockdata/'; // smaller dataset
    // const mockDataDir = 'assets/data/mockdata/large/'; // larger dataset

    // site types
    this.mockData[this.ENDPOINTS.SITETYPES] = await this.getLocalGeojson(
      `${mockDataDir}${this.ENDPOINTS.SITETYPES}.json`
    )
      .pipe(map(this.formatSiteTypeOpts))
      .toPromise();

    // BMP Categories and types
    this.mockData[this.ENDPOINTS.BMPTYPES] = await this.getLocalGeojson(
      `${mockDataDir}${this.ENDPOINTS.BMPTYPES}.json`
    ).toPromise();

    // Pollutant Categories and types
    this.mockData[this.ENDPOINTS.POLLUTANTTYPES] = await this.getLocalGeojson(
      `${mockDataDir}${this.ENDPOINTS.POLLUTANTTYPES}.json`
    ).toPromise();

    // paired data
    this.mockData[this.ENDPOINTS.PAIREDDATA] = await this.getLocalGeojson(
      `${mockDataDir}${this.ENDPOINTS.PAIREDDATA}.json`
    ).toPromise();

    // nonpaired data
    this.mockData[this.ENDPOINTS.NONPAIREDDATA] = await this.getLocalGeojson(
      `${mockDataDir}${this.ENDPOINTS.NONPAIREDDATA}.json`
    ).toPromise();
  }
}
