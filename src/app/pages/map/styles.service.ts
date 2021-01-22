import { Injectable } from '@angular/core';
import { Circle, Fill, RegularShape, Icon, Stroke, Style, Text } from 'ol/style';
import * as _ from 'lodash';
import { Events } from '@ionic/angular';
import { GsLayer } from './layers.service';
import { Shared } from '../../core/services/shared';
import { AbstractengineService } from '../../core/services/abstractengine.service';

const COLORS = {
  grayRGBA: 'rgba(0,0,0,0.2)',
  black: '#000',
  gray: '#888',
  blue: 'blue',
  red: 'red',
  green: 'green',
  greenRGBA: 'rgba(56, 163, 129, 0.5)',
  lightblue: 'blue',
  lightGray: '#ddd',
  orange: 'rgb(255, 167, 38)',
  purple: '#5f4c94',
  purpleRGBA: 'rgba(95, 76, 148, 0.6)',
  darkPurpleRGBA: 'rgba(106,26,154,0.8)',
  steelblue: 'steelblue',
  turq: 'rgb(100, 253, 255)',
  white: '#fff',
  yellow: 'yellow',
};

@Injectable({
  providedIn: 'root',
})
export class MapStyleService extends AbstractengineService {
  maxShowLabelsResolution = 10.6;
  public COLORS = COLORS;

  blueTriangle = new Icon({
    src: 'img/blueTriangle.png',
  });

  redDiamond = new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'img/redDiamond.png',
  });

  selectedHollowCircle = new Circle({
    radius: 12,
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 5,
    }),
  });

  locationCircle = new Circle({
    radius: 12,
    fill: new Fill({
      color: 'rgba(213, 0, 249,0.9)',
    }),
    stroke: new Stroke({
      color: 'white',
      width: 3,
    }),
  });
  yellowSmallCircleSVG = new Circle({
    radius: 12,
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.9)',
    }),
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
  });

  mapFeatureStyles = {
    // used for selected features
    Selected: new Style({
      image: this.selectedHollowCircle,
    }),
    Selectedfeature: new Style({
      image: this.yellowSmallCircleSVG,
    }),
    SelectedfeatureOther: new Style({
      stroke: new Stroke({
        color: 'yellow',
        lineDash: [4],
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
      }),
    }),
    user: new Style({
      image: this.locationCircle,
    }),
    blueTriangle: new Style({
      image: this.blueTriangle,
    }),
    redDiamond: new Style({
      image: this.redDiamond,
    }),
    Polygon: new Style({
      stroke: new Stroke({
        color: 'yellow',
        lineDash: [4],
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
      }),
    }),
    GeometryCollection: new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 2,
      }),
      fill: new Fill({
        color: 'magenta',
      }),
      image: new Circle({
        radius: 10,
        fill: null,
        stroke: new Stroke({
          color: 'magenta',
        }),
      }),
    }),
    Circle: new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)',
      }),
    }),
  };

  private styleCache: any = {
    filled: false,
  }; // holds styles generate in constructor
  constructor(
    public evts: Events, // pubsub for modal forms etc,

    shared: Shared
  ) {
    super(evts, shared);
    console.log('Hello from Style.service');
    this.generateStyles();
  }

  private generateStyles() {
    console.log('inside generateStyles');
    if (this.styleCache && this.styleCache.filled) {
      return this.styleCache;
    }

    const styleProps = {
      BMPSites: { type: 'proposedDynamicShape', shape: 'circle', color: COLORS.greenRGBA },
    };
    _.map(styleProps, (itm, key) => {
      if (itm.type && itm.type === 'proposedDynamicShape') {
        this.styleCache[key] = this.generateShapeStyleFxn(key, itm.shape, itm.color, itm.color);
      } else if (itm.shape) {
        this.styleCache[key] = this.generateShapeStyle(itm.shape, itm.color, itm.thickness || 2);
      }
    });
    this.mapFeatureStyles = { ...this.mapFeatureStyles, ...this.styleCache };
    this.styleCache.filled = true;
  }

  generateLineStyle(color = 'rgb(0,0,0)', width = 2) {
    return new Style({
      stroke: new Stroke({
        color,
        width,
      }),
    });
  }
  generatePolygonStyle(rgbaColor, width = 2, strokeColor = null) {
    return new Style({
      stroke: new Stroke({
        color: strokeColor || rgbaColor,
        lineDash: [4],
        width,
      }),
      fill: new Fill({
        color: rgbaColor,
      }),
    });
  }
  getDirectedArrowImg(angleDegrees: number) {
    const svgArrow = `<svg width="160" height="160" version="1.1"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" viewPort="0 0 160 160" class="svgClass">
    <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth" viewBox="0 0 20 20">
    <path d="M0,0 L0,6 L9,3 z" fill="#4169E1" />
    </marker>
    </defs>
    <line x1="0" y1="30" x2="10" y2="30" stroke="#4169E1" stroke-width="5" marker-end="url(#arrow)" />
    </svg>`;

    return (feature, resolution) => {
      const img = new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        rotateWithView: true,
        rotation: ((+feature.values_.Flow_Direc / 180) * Math.PI) / 2.0,
        src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgArrow),
      });
      return new Style({
        image: img,
      });
    };
  }

  generateCircleCrossSVGImg(strokeColor: string = 'blue', fillColor = 'none', textfxn = null) {
    const strokeWidth = 9;
    const template = `<svg width="100" height="100" version="1.1"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" viewPort="0 0 50 50" class="svgClass">
    <circle stroke="${strokeColor}" cx="50" cy="50" r="45" fill="${fillColor}" stroke-width="${strokeWidth}"></circle>
    <line stroke="${strokeColor}" x1="0" y1="50" x2="100" y2="50" stroke-width="${strokeWidth}"></line>
    <line stroke="${strokeColor}" x1="50" y1="0" x2="50" y2="100" stroke-width="${strokeWidth}"></line>
  </svg>`;

    const img = new Icon({
      opacity: 1,
      src: 'data:image/svg+xml;utf8,' + encodeURIComponent(template),
      scale: 0.3,
    });
    return new Style({
      image: img,
      // text: textfxn
    });
  }

  generateShapeStyleFxn(key: string, shape: string, colorDefault: string, colorTouched: string) {
    let strokeColor = COLORS.black;
    let strokeWidth = 3;
    const radius1 = 10;
    const textfxn = null;
    return (feature, resolution) => {
      let color = colorDefault || 'black';
      switch (key) {
        case 'BMPSitesCluster':
          color = COLORS.white;
          strokeWidth = 4;
          break;
        case 'BMPSites':
          strokeWidth = 1;
          if (feature && feature.values_) {
            const cat =
              feature.values_ && feature.values_.features && feature.values_.features.length
                ? feature.values_.features[0].values_.category
                : feature.values_.category;
            switch (cat) {
              /*case 'Biofilter':
                color = COLORS.white;
                strokeColor = COLORS.blue;
                shape = 'circleCross';
                break;*/

              case 'Bioretention':
                color = COLORS.green;
                strokeColor = COLORS.yellow;
                shape = 'circleCross';
                break;
              case 'Composite':
                color = COLORS.yellow;
                strokeColor = COLORS.black;
                shape = 'circleCross';
                break;
              case 'Control':
                color = COLORS.turq;
                strokeColor = COLORS.black;
                shape = 'circle';
                break;
              case 'Detention Basin':
                color = COLORS.steelblue;
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'Detention Basin':
                color = '#fdd835';
                strokeColor = COLORS.black;
                shape = 'square';
                break;

              case 'Education':
                color = '#fdd835';
                strokeColor = COLORS.black;
                shape = 'square';
                break;

              case 'Grass Swale':
                color = 'green';
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'Grass Strip':
                color = COLORS.green;
                strokeColor = COLORS.orange;
                shape = 'circleCross';
                break;
              case 'Green Roof':
                color = COLORS.steelblue;
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'Infiltration Basin':
                color = 'rgba(0,0,0,0.2)';
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'LID':
                color = COLORS.yellow;
                strokeColor = COLORS.gray;
                shape = 'circle';
                break;
              case 'Maintenance Practice':
                color = COLORS.white;
                strokeColor = COLORS.red;
                shape = 'circleCross';
                break;
              case 'Manufactured Device':
                color = 'rgb(245, 87, 245)';
                strokeColor = COLORS.black;
                shape = 'triangle';
                break;
              case 'Media Filter':
                color = COLORS.green;
                strokeColor = COLORS.yellow;
                shape = 'square';
                break;

              case 'Other':
                color = COLORS.gray;
                strokeColor = COLORS.lightGray;
                shape = 'triangle';
                break;
              case 'Percolation Trench':
                color = COLORS.red;
                strokeColor = COLORS.red;
                shape = 'x';
                break;
              case 'Percolation Trench/Well':
                color = COLORS.red;
                strokeColor = COLORS.red;
                shape = 'x';
                break;
              case 'Porous Pavement':
                color = COLORS.gray;
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'Permeable Friction Course':
                color = 'rgb(134, 97, 26)';
                strokeColor = COLORS.black;
                shape = 'triangle';
                break;
              case 'Rainwater Harvesting':
                color = 'rgb(63, 159, 236)';
                strokeColor = COLORS.black;
                shape = 'star';
                break;
              case 'Retention Pond':
                color = COLORS.blue;
                strokeColor = COLORS.black;
                shape = 'square';
                break;
              case 'Wetland Basin':
                color = 'lime';
                strokeColor = COLORS.black;
                shape = 'star';
                break;
              case 'Wetland Channel':
                color = 'lime';
                strokeColor = COLORS.red;
                shape = 'square';
                break;
              default:
                color = COLORS.white;
                strokeColor = COLORS.black;
                shape = 'circle';
                console.log('Unknown BMP Category');
            }
          }
          break;
        default:
          color =
            feature && feature.values_ && feature.values_.proposedUpdate
              ? colorTouched
              : colorDefault;
      }
      return this.generateShapeStyle(shape, color, strokeWidth, strokeColor, radius1, textfxn);
    };
  }

  generateShapeStyle(
    shape: string,
    color: string,
    strokeWidth = 2,
    strokeColor = null,
    radius1 = 10,
    textfxn = null
  ) {
    const stroke = new Stroke({ color: strokeColor || color, width: strokeWidth });
    const fill = new Fill({ color });

    const shapes = {
      circle: new Style({
        image: new Circle({
          radius: radius1,
          fill,
          stroke,
        }),
        text: textfxn,
      }),
      polygon: new Style({
        fill,
        stroke,
        geometry: (feature) => {
          const originalFeature = feature.get('features');
          return originalFeature[0].getGeometry();
        },
        text: textfxn,
      }),
      square: new Style({
        image: new RegularShape({
          fill,
          stroke,
          points: 4,
          radius: radius1,
          angle: Math.PI / 4,
        }),
        // text: textfxn
      }),
      triangle: new Style({
        image: new RegularShape({
          fill,
          stroke,
          points: 3,
          radius: radius1,
          rotation: Math.PI / 4,
          angle: 0,
        }),
        text: textfxn,
      }),
      star: new Style({
        image: new RegularShape({
          fill,
          stroke,
          points: 5,
          radius: radius1,
          radius2: 4,
          angle: 0,
        }),
        // text: textfxn
      }),
      cross: new Style({
        image: new RegularShape({
          fill,
          stroke,
          points: 4,
          radius: radius1,
          radius2: 0,
          angle: 0,
        }),
        // text: textfxn
      }),
      x: new Style({
        image: new RegularShape({
          fill,
          stroke,
          points: 4,
          radius: radius1,
          radius2: 0,
          angle: Math.PI / 4,
        }),
        // text: textfxn
      }),
      circleCross: this.generateCircleCrossSVGImg(strokeColor, color, textfxn),
    };
    return shapes[shape];
  }

  // utility fxn for labeling features
  getText(feature, resolution) {
    let labelText = '';
    if (resolution > this.maxShowLabelsResolution) {
      labelText = '';
    } else {
      const features = feature.get('features');

      let feat = feature;
      // for clusters
      if (features && features.length) {
        feat = features[0];
      }
      const entityType = feat.get('entityType');
      if (entityType && entityType === 'Historical_UVOST') {
        labelText = (feat.get('Name') && feat.get('Name').slice(-5)) || '';
      } else {
        labelText = feat.get('Alt_Name') || feat.get('id') || 'unknown id';
      }
    }
    return labelText + '';
  }

  createTextStyle(feature, resolution) {
    return new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      offsetY: 20,
      offsetX: 20,
      font: 'bold 12px Verdana',
      text: this.getText(feature, resolution),
      fill: new Fill({
        color: 'white',
      }),
      stroke: new Stroke({
        color: 'black',
        width: 3,
      }),
    });
  }

  styleFunction(feature) {
    return this.mapFeatureStyles[feature.getGeometry().getType()];
  }

  styleFunctionEntityType(obj: GsLayer, entityType: string) {
    const defaultStyle = this.mapFeatureStyles[entityType];
    return defaultStyle;
  }
}
