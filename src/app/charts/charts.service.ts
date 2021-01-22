import { Injectable } from '@angular/core';
import { Shared } from '../core/services/shared';
import { PlotData } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor(
    private shared: Shared
  ) { }


  makePlotlyPlots(pairedData: PlotData, allData: PlotData) {
    const parameter = allData.query.parameter || 'Multiple Parameters';
    // begin for theoretical quantiles
    const x3 = allData.influentParams.ppfvalues;
    const y3 = allData.influentParams.sortedData;
    const x4 = allData.effluentParams.ppfvalues;
    const y4 = allData.effluentParams.sortedData;
    // end for theoretical quantiles

    const traces = [
      // time series plot - influent detected
      {
        name: 'Influent Detected',
        x: allData.inflowDates,
        y: allData.inflowValues,
        xaxis: 'x',
        yaxis: 'y',
        legendgroup: 'in',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'green',
          size: 12,
          opacity: 0.4,
          symbol: 'triangle-up',
          line: {
            color: 'white',
            width: 0.5
          }
        }
      },
      // time series plot - influent not detected
      {
        name: 'Influent Not Detected',
        x: allData.inflowNDDates,
        y: allData.inflowNDValues,
        xaxis: 'x',
        yaxis: 'y',
        legendgroup: 'inND',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'rgba(0, 0, 0, 0)',
          size: 12,
          opacity: 0.4,
          symbol: 'triangle-up',
          line: {
            color: 'green',
            width: 1
          }
        }
      },
      // time series plot - effluent detected
      {
        name: 'Effluent Detected',
        x: allData.outflowDates,
        y: allData.outflowValues,
        xaxis: 'x',
        yaxis: 'y',
        legendgroup: 'out',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'blue',
          size: 12,
          opacity: 0.2,
          symbol: 'square',
          line: {
            color: 'white',
            width: 0.5
          }
        }
      },
      // time series plot - effluent not detected
      {
        name: 'Effluent Not Detected',
        x: allData.outflowNDDates,
        y: allData.outflowNDValues,
        xaxis: 'x',
        yaxis: 'y',
        legendgroup: 'outND',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'rgba(0, 0, 0, 0)',
          size: 12,
          opacity: 0.2,
          symbol: 'square',
          line: {
            color: 'blue',
            width: 1
          }
        }
      },

      // box plot - values influent
      {
        name: 'Influent',
        y: allData.inflowValues,
        xaxis: 'x2',
        yaxis: 'y2',
        legendgroup: 'in',
        type: 'box',
        showlegend: false,
        marker: {
          color: 'green',
          symbol: 'triangle-up',
          opacity: 0.15
        },
        boxpoints: 'all',
        jitter: 0.1,
        pointpos: -2
      },
      // box plot - values effluent
      {
        name: 'Effluent',
        y: allData.outflowValues,
        xaxis: 'x2',
        yaxis: 'y2',
        legendgroup: 'out',
        type: 'box',
        showlegend: false,
        marker: {
          color: 'blue',
          symbol: 'square',
          opacity: 0.15
        },
        boxpoints: 'all',
        jitter: 0.1,
        pointpos: -2
      },
      // theoretical quantiles
      {
        name: 'Influent Detected',
        x: x3,
        y: y3,
        xaxis: 'x3',
        yaxis: 'y3',
        legendgroup: 'in',
        showlegend: false,
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'green',
          size: 10,
          opacity: 0.2,
          symbol: 'triangle-up',
          line: {
            color: 'white',
            width: 0.5
          }
        }
      },
      // theoretical quantiles
      {
        name: 'Effluent Detected',
        x: x4,
        y: y4,
        xaxis: 'x3',
        yaxis: 'y3',
        legendgroup: 'out',
        showlegend: false,
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'blue',
          size: 10,
          opacity: 0.2,
          symbol: 'square',
          line: {
            color: 'white',
            width: 0.5
          }
        }
      },
      // Influent/effluent plot
      {
        name: '1:1 Line',
        x: [Math.pow(10, pairedData.minpt), Math.pow(10, pairedData.maxpt)],
        y: [Math.pow(10, pairedData.minpt), Math.pow(10, pairedData.maxpt)],
        xaxis: 'x4',
        yaxis: 'y4',
        type: 'scatter',
        mode: 'lines',
        hoverinfo: 'none',
        line: {
          color: 'black',
          width: 2
        }
      },
      // Influent/effluent plot
      {
        name: 'Detected Data Pairs',
        y: pairedData.outflowPairedValues,
        x: pairedData.inflowPairedValues,
        xaxis: 'x4',
        yaxis: 'y4',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'orange',
          opacity: 0.6,
          size: 10,
          symbol: 'circle'
        }
      },
      // influent/effluent plot
      {
        name: 'Influent Not Detected',
        // y: pairedData.ndInflOnlyEffl,
        // x: pairedData.ndInflOnlyInfl,
        y: pairedData.inflowNDValues,
        x: pairedData.inflowNDDates,
        xaxis: 'x4',
        yaxis: 'y4',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: '#7b3294',
          size: 10,
          symbol: 'triangle-down-open'
        }
      },
      // influent/effluent plot
      {
        name: 'Effluent Not Detected',
        y: pairedData.ndEfflOnlyEffl,
        x: pairedData.ndEfflOnlyInfl,
        xaxis: 'x4',
        yaxis: 'y4',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: '#7b3294',
          size: 10,
          symbol: 'triangle-left-open'
        }
      },  // influent/effluent plot
      {
        name: 'Both Not Detected',
        y: pairedData.ndBothInfl,
        x: pairedData.ndBothInfl,
        xaxis: 'x4',
        yaxis: 'y4',
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: '#7b3294',
          size: 10,
          symbol: 'diamond-open'
        }
      }
    ];

    const layout = {    // time series plot
      width: 1170,
      height: 1300,
      xaxis: {
        anchor: 'y',
        title: 'Date',
        // tickformat: '%b ' % y',
        showline: true,
        domain: [0, 1]
      },
      //  time series plot
      yaxis: {
        anchor: 'x',
        title: this.shared.sentenceCase(parameter).concat(' (', allData.unit, ')'),
        showgrid: false,
        showline: true,
        type: 'log',
        domain: [0, .2]
      },
      // box plot values
      xaxis2: {
        anchor: 'y2',
        title: 'Flow Type',
        showline: true,
        fixedrange: true,
        domain: [0, 0.2]
      },
      // box plot values
      yaxis2: {
        anchor: 'x2',
        title: this.shared.sentenceCase(parameter).concat(' (', allData.unit, ')'),
        showgrid: true,
        showline: true,
        type: 'log',
        domain: [0.84, 1.2]
      },
      // theoretical quantile plot
      xaxis3: {
        title: 'Theoretical Quantiles',
        anchor: 'y3',
        showline: true,
        domain: [.25, 0.9]
      },
      // theoretical quantile plot
      yaxis3: {
        anchor: 'x3',
        title: this.shared.sentenceCase(parameter).concat(' (', allData.unit, ')'),
        side: 'right',
        showgrid: true,
        showline: true,
        type: 'log',
        domain: [0.84, 1.2]
      },
      // influent/effluent plot
      xaxis4: {
        anchor: 'y4',
        title: 'Influent Concentration ('.concat(pairedData.unit, ')'),
        showgrid: true,
        showline: true,
        type: 'log',
        autorange: false,
        range: [pairedData.minpt, pairedData.maxpt],
        domain: [0.197, 0.7935]
      },
      // influent/effluent plot
      yaxis4: {
        anchor: 'x4',
        title: 'Effluent Concentration ('.concat(pairedData.unit, ')'),
        showgrid: true,
        showline: true,
        type: 'log',
        autorange: false,
        range: [pairedData.minpt, pairedData.maxpt],
        domain: [0.3, 0.7]
      }
    };

    const modebar = {
      displayModeBar: true,
      displaylogo: false,
      showTips: true,
      modeBarButtonsToRemove: ['sendDataToCloud', 'resetScale2d',
        'zoomIn2d', 'zoomOut2d', 'select2d', 'lasso2d'
      ]
    };
    return { traces, layout, modebar };
  }

}
