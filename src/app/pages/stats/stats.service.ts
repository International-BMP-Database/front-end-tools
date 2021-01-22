import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as jStat from 'jStat';
import { GuassianService } from './guassian.service';
import { GsstatsService } from './gsstats.service';
import { Shared } from '@core/shared';
import { StatsQuery, PairedData, PlotData, PlotDataAll } from '@core/models';
import { Remotedata } from '@core/remotedata';
import * as Genstats from 'genstats';

// Variables used in multiple functions
const MIN_POINTS = 10;
const MIN_DATACOUNT = 1; // if less than 1 data point table stats not shown
const defaultDCP = 2; // default decimal places to round to

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  public DATAMODES = {
    PAIRED: 'paired',
    ALLDATA: 'flat' // this is all the data
  };
  // selectedSite: any;

  constructor(
    private shared: Shared,
    private GL: GsstatsService,
    private guassianSrvc: GuassianService,
    private dataSrvc: Remotedata
  ) { }

  async getDownloadData(formValues: StatsQuery) {
    return this.processQuery(formValues, true);
  }

  private filterByBMPID(data: any[], bmpID: string) {
    return data.filter(itm => itm.bmp_id === bmpID);
  }

  async processQuery(formValues: StatsQuery, downloadOnly = false) {
    let pairedFiltered = [], allDataFiltered = [], processedData: any;
    const status = {
      errors: [],
      msgs: [],
      code: 200, // 200 ok see html status codes
    };
    // form to db fields mapping
    const flds = {
      // aadt: 'aadt', filled as {lower:x, upper:y} so handle seperately
      // epaRainZone - numeric so handle seperately
      bmpCategory: 'category',
      bmp: 'bmp',
      pollutantCategory: 'paramgroup',
      parameter: 'parameter',
      siteType: 'dot_type'
    };

    // fetch data
    const pairedData = await this.dataSrvc.getWQData(this.DATAMODES.PAIRED,
      formValues.parameter || null, formValues.bmpCategory || null, formValues.siteType || null, formValues.epaRainZone || null,
      undefined, undefined);

    const allData = await this.dataSrvc.getWQData(this.DATAMODES.ALLDATA,
      formValues.parameter || null, formValues.bmpCategory || null, formValues.siteType || null, formValues.epaRainZone || null,
      undefined, undefined);

    if (pairedData && allData && pairedData.length && allData.length) {

      if (this.shared.selectedSite && this.shared.selectedSite.bmp_id) {
        // filter by BMP ID if coming from the map
        pairedFiltered = this.filterByBMPID(pairedData, this.shared.selectedSite.bmp_id);
        allDataFiltered = this.filterByBMPID(allData, this.shared.selectedSite.bmp_id);
      } else {
        pairedFiltered = [...pairedData];
        allDataFiltered = [...allData];
      }

      if (pairedFiltered && pairedFiltered.length) { // assume enough paired means enough all data
        // process filtered data
        if (!downloadOnly) { // no need to process download data
          processedData = this.processData(formValues.dataMode, pairedFiltered, allDataFiltered, formValues);
        }
      } else {
        status.code = 201;
        status.errors.push('Not enough data. Please try a less restrictive query or other parameters');
      }
    } else {
      if (!pairedData) {
        status.code = 500;
        status.errors.push('Unable to fetch data. Please try again later');
      } else {
        status.code = 201;
        status.errors.push('Not enough data. Please try a less restrictive query or other parameters');
      }
    }

    const results = downloadOnly ? { status, pairedFiltered, allDataFiltered } : { status, processedData };
    return results;
  }

  private processData(dataMode: string, pairedData: any[], allData: any[], formValues: StatsQuery) {
    const pairedPlotData = this.transformData(pairedData);
    const allPlotData = this.transformDataNonPaired(allData);
    const basicStats = this.computeBasicStats(allPlotData);

    // formvalues will always contain parameter cause required
    pairedPlotData.query = formValues;
    allPlotData.query = formValues;
    return {
      basicStats, pairedPlotData, allPlotData, status: {
        basicStats: allPlotData.inflowValues.length < MIN_DATACOUNT ||
          allPlotData.outflowValues.length < MIN_DATACOUNT ? 'insufficient_data' : 'ok'
      }
    };
  }

  private getDataUnits(data): string {
    if (data && data.length) {
      return data[0].units;
    }
    return '';
  }

  private computeBasicStats(data: any) {
    const units = data && data.allData ? this.getDataUnits(data.allData) : '';
    const stats = {
      numEMCs: { statistic: 'Number of EMCs', influent: -1, effluent: -1, comparison: '' },
      percentND: { statistic: 'Percent of NDs (%)', influent: -1, effluent: -1, comparison: '' },
      percent25th: { statistic: `25th Percentile (${units})`, influent: -1, effluent: -1, comparison: '' },
      median: { statistic: `*Median (${units})`, influent: -1, effluent: -1, comparison: '' },
      percent75th: { statistic: `75th Percentile (${units})`, influent: -1, effluent: -1, comparison: '' },
      mean: { statistic: `Mean (${units})`, influent: -1, effluent: -1, comparison: '' },
      stdDev: { statistic: `Standard Deviation (${units})`, influent: -1, effluent: -1, comparison: '' },
      cov: { statistic: 'Coef. of Variation', influent: -1, effluent: -1, comparison: '' },
    };
    const statKeys = ['influent', 'effluent'];
    const dataKeys = ['inflowValues', 'outflowValues'];
    const dataNDKeys = ['inflowNDValues', 'outflowNDValues'];
    const totalDataCount = data.allData && data.allData.length ? data.allData.length : 0;
    if (data) {
      _.map(statKeys, (key, idx) => {
        const dataKey = dataKeys[idx];
        const dataNDKey = dataNDKeys[idx];
        if (data[dataKey] && totalDataCount) {
          // compute stats on the Detect and non-detect data

          const _full_array = data[dataKey].concat(data[dataNDKey]);
          const station_stats = jStat(_full_array);
          const sufficient_data = _full_array.length < MIN_DATACOUNT;

          stats.numEMCs[key] = _full_array.length; // add detects to non-detects to get total count
          stats.median[key] = sufficient_data ? '-' : this.gsround(station_stats.median(), defaultDCP);
          stats.mean[key] = sufficient_data ? '-' : this.gsround(station_stats.mean(), defaultDCP);
          stats.stdDev[key] = sufficient_data ? '-' : this.gsround(station_stats.stdev(true), defaultDCP);
          stats.cov[key] = sufficient_data ? '-' : this.gsround(station_stats.stdev(true) / station_stats.mean(), defaultDCP);
          stats.percent25th[key] =
            sufficient_data ? '-' : this.gsround(jStat.percentile(_full_array, 0.25), defaultDCP);

          stats.percent75th[key] =
            sufficient_data ? '-' : this.gsround(jStat.percentile(_full_array, 0.75), defaultDCP);
          stats.percentND[key] = this.gsround(100.0 * data[dataNDKey].length / _full_array.length, 0);
        }
      });
      // compute increased / decreased
      _.map(stats, row => {
        row.comparison = row.influent === -1 || row.effluent === -1 ? 'NA' :
          row.influent === row.effluent ? 'Equal' :
            row.influent < row.effluent ? 'Increased' : 'Decreased';
      });
      return [
        stats.numEMCs,
        stats.percentND,
        stats.percent25th,
        stats.median,
        stats.percent75th,
        stats.mean,
        stats.stdDev,
        stats.cov,
      ];
    }
  }

  public computeHypothesisTests(pairedData: PlotData, allData: PlotData) {
    const stats = {
      mannWhitney: {
        statsTest: 'Mann-Whitney',
        dataType: 'Raw',
        nullHypo: 'The medians of the inflow and outflow EMCs are equal.', pval: '', pfmt: '', p05: '', p10: ''
      },
      wilcoxon: {
        statsTest: 'Wilcoxon',
        dataType: 'Raw',
        nullHypo: 'The medians of the differences of the inflow and outflow EMCs are equal.', pval: '', pfmt: '', p05: '', p10: ''
      },
      tTest: {
        statsTest: 't-Test (Assume Unequal Variance)',
        dataType: 'Raw',
        nullHypo: 'The means of the inflow and outflow EMCs are equal.', pval: '', pfmt: '', p05: '', p10: ''
      },
      tTestLog: {
        statsTest: 't-Test (Assume Unequal Variance)',
        dataType: 'Log',
        nullHypo: 'The means of the inflow and outflow EMCs are equal.', pval: '', pfmt: '', p05: '', p10: ''
      },
    };

    let pval = Genstats.wilcoxon(allData.inflowValues, allData.outflowValues);
    if (pval !== undefined && pval.p !== undefined) {
      const { pfmt, p05, p10 } = this.compareP(pval.p);
      stats.mannWhitney = { ...stats.mannWhitney, pfmt, p05, p10 };
    }

    pval = this.WilcoxonRank(pairedData.inflowValues, pairedData.outflowValues);
    if (pval !== undefined && pval.p !== undefined) {
      const { pfmt, p05, p10 } = this.compareP(pval.p);
      stats.wilcoxon = { ...stats.wilcoxon, pfmt, p05, p10 };
    }

    let welchP: any = '--';
    try {
      const temp = Genstats.welch(pairedData.inflowValues, pairedData.outflowValues);
      welchP = 2 * temp.p;
    } catch (e) {
      welchP = 'NaN';
    }
    if (welchP !== undefined && welchP !== 'NaN') {
      const { pfmt, p05, p10 } = this.compareP(welchP);
      stats.tTest = { ...stats.tTest, pfmt, p05, p10 };
    }

    const logIn = pairedData.inflowValues.map(Math.log10);
    const logOut = pairedData.outflowValues.map(Math.log10);
    try {
      welchP = 2 * (Genstats.welch(logIn, logOut)).p;
    } catch (e) {
      welchP = 'NaN';
    }
    if (welchP !== undefined && welchP !== 'NaN') {
      const { pfmt, p05, p10 } = this.compareP(welchP);
      stats.tTestLog = { ...stats.tTestLog, pfmt, p05, p10 };
    }
    return stats;

  }

  private compareP(pval) {
    let p05 = 'Different';
    let p10 = 'Different';
    let pfmt = this.to3SI(pval);
    if (pval < 0.0001) {
      pfmt = '0.0000';
    }
    if ((pval === 'NaN') || (pval > 1) || (pval < 0.0)) {
      pfmt = '--';
      p05 = '--';
      p10 = '--';
    } else if (pval >= 0.05) {
      p05 = 'Equal';
      if (pval >= 0.1) {
        p10 = 'Equal';
      }
    } else { }
    return ({ pfmt, p05, p10 });
  }

  private transformDataNonPaired(data: PairedData[]) {
    const ts: PlotDataAll = {
      allData: [...data],
      maxpt: -1,
      minpt: -1,

      inflowDates: [],
      inflowValues: [],
      inflowNDValues: [],
      inflowNDDates: [],

      outflowDates: [],
      outflowValues: [],
      outflowNDValues: [],
      outflowNDDates: [],

      // for quantile plots
      influentParams: null,
      effluentParams: null,
      // end quantile plots
      unit: data[0].units,
      query: null, // populated later
    };
    // convert dates
    data = _.map(data, itm => {
      itm.data = new Date(itm.date);
      return itm;
    });

    // begin process inflows //
    const inflowData = _.filter(data, { station: 'inflow' });
    // inflow/influent
    const inflowDetected = _.filter(inflowData, { qual: '=' });
    ts.inflowDates = _.map(inflowDetected, 'date');
    ts.inflowValues = _.map(inflowDetected, 'value');

    const inflowND = _.filter(inflowData, { qual: 'ND' });
    ts.inflowNDDates = _.map(inflowND, 'date');
    ts.inflowNDValues = _.map(inflowND, 'value');
    // end process inflows //

    // begin process outflows //
    const outflowData = _.filter(data, { station: 'outflow' });
    const outflowDetected = _.filter(outflowData, { qual: '=' });
    ts.outflowDates = _.map(outflowDetected, 'date');
    ts.outflowValues = _.map(outflowDetected, 'value');

    const outflowND = _.filter(outflowData, { qual: 'ND' });
    ts.outflowNDDates = _.map(outflowND, 'date');
    ts.outflowNDValues = _.map(outflowND, 'value');

    // Get quantile data
    ts.influentParams = this.getQuantilePlotParams(ts.inflowValues);
    ts.effluentParams = this.getQuantilePlotParams(ts.outflowValues);

    return ts;
  }

  private transformData(data: PairedData[]) {
    const dateFld = 'sampledatetime';
    const ts: PlotData = {
      allData: [...data],
      maxpt: -1,
      minpt: -1,

      inflowDates: [],
      inflowValues: [],
      inflowNDValues: [],
      inflowNDDates: [],
      inflowPairedValues: [],

      outflowDates: [],
      outflowValues: [],
      outflowNDValues: [],
      outflowNDDates: [],
      outflowPairedValues: [],

      ndInflOnlyInfl: [],
      ndInflOnlyEffl: [],
      ndEfflOnlyInfl: [],
      ndEfflOnlyEffl: [],
      ndBothInfl: [],
      ndBothEffl: [],
      // for quantile plots
      influentParams: null,
      effluentParams: null,
      // end quantile plots
      unit: data[0].units,
      query: null, // populated later
    };
    // convert dates
    data = _.map(data, itm => {
      itm.data = new Date(itm.date);
      return itm;
    });

    // inflow/influent
    const inflowDetected = _.filter(data, { qual_inflow: '=' });
    ts.inflowDates = _.map(inflowDetected, dateFld);
    ts.inflowValues = _.map(inflowDetected, 'res_inflow');

    const inflowND = _.filter(data, { qual_inflow: 'ND' });
    ts.inflowNDDates = _.map(inflowND, dateFld);
    ts.inflowNDValues = _.map(inflowND, 'res_inflow');

    // get inflow = ND but outflow = Detect
    const inflowNDOutflowD = _.filter(inflowND, { qual_outflow: '=' });
    _.map(inflowNDOutflowD, itm => {
      ts.ndInflOnlyInfl.push(+itm.res_inflow);
      ts.ndInflOnlyEffl.push(+itm.res_outflow);
    });

    // outflow/effluent
    const outflowDetected = _.filter(data, { qual_outflow: '=' });
    ts.outflowDates = _.map(outflowDetected, dateFld);
    ts.outflowValues = _.map(outflowDetected, 'res_outflow');

    const outflowND = _.filter(data, { qual_outflow: 'ND' });
    ts.outflowNDDates = _.map(outflowND, dateFld);
    ts.outflowNDValues = _.map(outflowND, 'res_outflow');
    // get inflow = D but outflow = ND
    const outflowNDInflowD = _.filter(outflowND, { qual_inflow: '=' });
    _.map(outflowNDInflowD, itm => {
      ts.ndEfflOnlyInfl.push(+itm.res_inflow);
      ts.ndEfflOnlyEffl.push(+itm.res_outflow);
    });

    // get inflow = ND and outflow = ND
    const outflowNDInflowND = _.filter(outflowND, { qual_inflow: 'ND' });
    _.map(outflowNDInflowND, itm => {
      ts.ndBothInfl.push(+itm.res_inflow);
      ts.ndBothEffl.push(+itm.res_outflow);
      // ts.ndEfflOnlyEffl.push(+itm.res_outflow);
    });

    // both/paired
    const bothD = _.filter(inflowDetected, { pair: 'Pair' });
    _.map(bothD, itm => {
      ts.inflowPairedValues.push(+itm.res_inflow);
      ts.outflowPairedValues.push(+itm.res_outflow);
    });

    ts.maxpt = 2 + this.ceil_power_of_10(Math.max(_.max(ts.inflowPairedValues), _.max(ts.outflowPairedValues)));
    ts.minpt = -1 + this.floor_power_of_10(Math.min(_.min(ts.inflowPairedValues), _.min(ts.outflowPairedValues)));

    // Get quantile data
    ts.influentParams = this.getQuantilePlotParams(ts.inflowValues);
    ts.effluentParams = this.getQuantilePlotParams(ts.outflowValues);
    return ts;
  }

  private filterData(flds: any, formValues: StatsQuery, data: any[]) {
    if (!data || !data.length) { return []; }

    let filteredData = data;
    // filter for site if specific site selected e.g. comming from map link
    if (this.shared.selectedSite) {
      filteredData = _.filter(filteredData, itm => {
        return (itm.site_id === this.shared.selectedSite.site_id);
      });
    }
    _.map(flds, ((itm, key) => {
      if (formValues && formValues[key] !== undefined && formValues[key] !== null && formValues[key] !== '') {
        // for consistency assume multiple values for all formvalues
        const filterBy = typeof formValues[key] === 'object' ? [...formValues[key]] : [formValues[key]];
        // for consistency assume any filter can have all and skip if filtering if all included in list
        if (filterBy && filterBy.length && filterBy.indexOf('All') === -1) {
          filteredData = filteredData.filter(row => {
            for (const filter of filterBy) {
              if (row[itm] === filter) { return true; }
            }
            return false;
          });
        }
      }
    }));

    // filter for aadt
    if (formValues && formValues.aadt && filteredData && filteredData.length) {
      const aadt: any = formValues.aadt;
      filteredData = _.filter(filteredData, itm => {
        return (itm.aadt >= aadt.lower) && (itm.aadt <= aadt.upper);
      });
    }

    // filter for epa rain zone
    // if one rainzone was selected it was passed it to the backend so no front end filtering needed
    // if multiple rainzones were checked data was fetched for all rain zones so must filter client side, however if multiple rainzones
    // included 'All' no client side filtering needed
    const includesAll = formValues.epaRainZone && formValues.epaRainZone.length && _.indexOf(formValues.epaRainZone, 'All') !== -1;

    if (formValues && formValues.epaRainZone && formValues.epaRainZone.length > 1 && !includesAll && filteredData && filteredData.length) {
      filteredData = filteredData.filter(row => {
        for (const epazone of formValues.epaRainZone) {
          if (+row.epazone === +epazone) { return true; }
        }
        return false;
      });
    }

    return filteredData;
  }

  private gsround(value, digits) {
    if (!digits) {
      digits = 2;
    }
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
  }

  private to3SI(num) {
    return parseFloat(num).toPrecision(3);
  }
  // to make first letter of words uppercase

  private ceil_power_of_10(n) {
    const exp = Math.ceil(Math.log10(n));
    return exp;
  }

  private floor_power_of_10(n) {
    const exp = Math.floor(Math.log10(n));
    return exp;
  }

  /**
   * Computes mean using Welford's algorithm
   */
  private computeMean(x) {
    let m = 0,
      i = -1;
    const n = x.length;
    if (n === 0) { return NaN; }
    while (++i < n) {
      m += (x[i] - m) / (i + 1);
    }
    return m;
  }

  /**
   * Computes unbiased estimate of a variance also know as the sample variance, where the denominator is n-1
   */
  private computeVariance(x) {
    let m, i = -1,
      s = 0,
      v;
    const n = x.length;
    if (n < 1) { return NaN; }
    if (n === 1) { return 0; }
    m = this.computeMean(x);
    while (++i < n) {
      v = x[i] - m;
      s += v * v;
    }
    return s / (n - 1);
  }

  /**
   *
   * @param data - array of number for which ploting positions are required
   * @param optionalSampleSize - optional sample size, data.length -1 used if not provided
   * @param optionalPostype - type of plotting position algorithm to use - 'cunnane' (alpha=0.4, beta=0.4) is the default value.
   * @param optionalAlpha - alpha is a parameters used to adjust the positions. Note needed if optionalPostype provided
   * @param optionalBeta - beta is a parameters used to adjust the positions. Note needed if optionalPostype provided
   */
  private plotPosition(data, sampleSize = null, postype = 'cunnane', optionalAlpha = null, optionalBeta = null) {
    let rslt = [];
    let sampleMean;
    // const sampleVar;
    // const postype = optionalPostype || 'cunnane';
    const posParamsLookUp = {
      type4: [0, 1],
      type5: [0.5, 0.5],
      type6: [0, 0],
      type7: [1, 1],
      type8: [1 / 3.0, 1 / 3.0],
      type9: [0.375, 0.375],
      weibull: [0, 0],
      median: [0.3175, 0.3175],
      apl: [0.35, 0.35],
      pwm: [0.35, 0.35],
      blom: [0.375, 0.375],
      hazen: [0.5, 0.5],
      cunnane: [0.4, 0.4],
      gringorten: [0.44, 0.44]
    };
    const posParams = posParamsLookUp[postype]; // getPosParams(optionalAlpha, optionalBeta);
    const alpha = optionalAlpha || posParams[0];
    const beta = optionalBeta || posParams[1];

    if (data !== undefined) {
      sampleMean = this.computeMean(data);
      const sampleconst = Math.sqrt(this.computeVariance(data));
      // sampleSize = optionalSampleSize || data.length;
      data.sort((a, b) => a - b);
      rslt = _.range(1, sampleSize + 1).map((i) => {
        const position = (i - alpha) / (sampleSize + 1 - alpha - beta);
        return position;
      });
      return {
        sortedData: data,
        plottingPos: rslt,
        mean: sampleMean,
        // variance: sampleVar
      };
    }
    return false;
  }

  /**
   * Takes ploting positions and computes the standard normal percentile point functions using
   * libraray form https://github.com/errcw/gaussian
   * @param  plottingPos -
   * @param mean - mean of the data
   * @param variance - variance of the data
   */
  private computePPF(plottingPos, mean, variance) {
    const rslts = [];
    // const gaussian = require('gaussian');
    const distribution = this.guassianSrvc.gaussian(mean, variance);
    // Take a random sample using inverse transform sampling method.
    if (plottingPos !== undefined) {
      _.range(plottingPos.length).map((i) => {
        const ppfval = distribution.ppf(plottingPos[i]);
        rslts.push(ppfval);
      });
      return rslts;
    }
    return false;
  }

  /**
   * Convenience of obtaining all quantile plot prameters
   * @param data -
   */
  private getQuantilePlotParams(data) {
    const n = data.length;
    const payload: any = this.plotPosition(data, n);
    const ppfvalues = this.computePPF(payload.plottingPos, 0, 1);
    payload.ppfvalues = ppfvalues;
    return payload;
  }

  /*
   for Wilcoxon signed Rank test, assumes array sizes are the same
   Algorithm to obtain z-values: https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test
   P-values from z-values are obtained using the the normalZ from: https://github.com/juhis/genstats
   */
  private WilcoxonRank(a, b) {
    let p = 0.05;
    let N = a.length < b.length ? a.length : b.length;
    let w = 0;

    const diffSign = [];
    let d0, ties;

    // 1-2. Get differences and signs, only keep those with a difference != 0.0
    for (let i = 0; i < N; i++) {
      d0 = b[i] - a[i];
      if (d0 !== 0) {
        diffSign.push({
          // diff: parseFloat(Math.abs(d_0)),
          diff: Math.abs(d0),
          sign: Math.sign(d0),
          rank: 0
        });
      }
    }

    // 3. Order the pairs from smalles abs diff to largest abs diff
    const diffSignRank = diffSign.slice();
    diffSignRank.sort(this.sortByDiff);
    N = diffSignRank.length;

    // 4. Rank the pairs, smallest being 1.
    let rankJ = 1;
    for (let i = 0; i < N; i++) {
      if (diffSignRank[i].rank !== 0) {
        continue;
      } else {
        ties = this.checkTies(i, diffSignRank, 0);
        if (ties === 0) {
          diffSignRank[i].rank = rankJ;
          rankJ += 1;
        } else {
          const avgRank = this.getSum(rankJ, ties) / (ties + 1);
          for (let j = i;
            (j <= i + ties && j < N); j++) {
            diffSignRank[j].rank = avgRank;
          }
          rankJ = rankJ + ties + 1;
        }
      }
    }
    for (let i = 0; i < N; i++) {
      w += diffSignRank[i].sign * diffSignRank[i].rank;
    }

    const z = Math.abs((w + 0.5) / Math.sqrt(N * (N + 1) * (2 * N + 1) / 6.0));
    p = Math.max(Number.MIN_VALUE, this.GL.normalZ(z));
    return { stat: w, p };
  }

  private SyncStr(strToChange) {
    return strToChange.toLowerCase().replace(/\s/g, '');
  }

  private getSum(rank, ties) {
    let sum = rank;
    for (let i = 1; i <= ties; i++) {
      sum = sum + rank + i;
    }
    return sum;
  }

  private checkTies(i, b, nTies) {
    if (i < b.length - 1) {
      if (b[i].diff < b[i + 1].diff) {
        return nTies;
      } else {
        return nTies + this.checkTies(i + 1, b, nTies + 1);
      }
    } else {
      return nTies;
    }
  }

  private sortByDiff(a, b) {
    const x = a.diff;
    const y = b.diff;
    let output;
    if (x < y) {
      output = -1;
    } else if (x > y) {
      output = 1;
    } else {
      output = 0;
    }
    return output;
  }

}
