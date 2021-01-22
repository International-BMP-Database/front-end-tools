import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import { defaults as defaultInteractions, Select as OlSelect } from 'ol/interaction.js';
import { Tile as TileLayer, Vector as VectorLayer, Group as GroupedLayers } from 'ol/layer.js';
import * as _ from 'lodash';
import { GsMapEvent, StatsQuery } from '@core/models';
import { Events } from '@ionic/angular';
import proj4 from 'proj4';
import { MapStyleService } from './styles.service';
import Overlay from 'ol/Overlay.js';
import { register } from 'ol/proj/proj4.js';
import { defaults as defaultControls, ScaleLine } from 'ol/control.js';
import { LayersService, GsLayer } from './layers.service';
import { fromLonLat } from 'ol/proj';
import { AbstractengineService } from '../../core/services/abstractengine.service';
import { Shared } from '../../core/services/shared';
import { Remotedata } from '@core/remotedata';

@Injectable({
  providedIn: 'root',
})
export class MapService extends AbstractengineService {
  private mySelectControl: any;
  public COLORS = this.MStyle.COLORS;
  private GSFeaturesCache = {
    featsArray: [],
    featsDict: {},
  };
  mapEvtTarget: any;
  showLegend = false;
  mapEventTypes = {
    legendShow: { label: 'Legend-Show' },
    legendHide: { label: 'Legend-Hide' },
    layersToggle: { label: 'Layers-Toggle' },
    closeModal: { label: 'Close-modal' },
  };

  prjwgs84 = 'EPSG:4326';
  prjUTM84 = 'EPSG:32601';
  mapprojection = this.prjwgs84;
  selectControl;
  defaultLayer = {
    // used in toggleLayer modal
    id: 0,
    label: '',
    isChecked: true,
  };
  defaults = {
    zoom: 8,
    zoomToLevel: 20,
    startLocation: [0, 40],
    extractStylesKml: false,
    popupOffset: [0, 0],
    geolocShortTrackDuration: 5000, // milliseconds
    geolocLongTrackDuration: 360000000, // milliseconds
  };

  bigMap: any;
  map: any;
  layerIndex = {}; // helps us find layers by entity without searching
  bigMapgeolocation;
  popupEls: any = {}; // handles to popups dom elements
  popup: any = {}; // this is the popup itself
  popupOverLay: Overlay;
  selectedSite: any;
  mapableTemplate = {
    id: 0,
    label: 'item title',
    symbol: 'defaultSymbol',
    lat: '0.0',
    lon: '0,0',
    userName: 'guest',
    projectNumber: 'PNW000',
    imageUri: 'images/blank.png',
    popupHtml: '<p>Default popup html text</p>',
  };

  public featuresLayer: VectorLayer; // populated inside createMap
  public siteFeaturesLayer: VectorLayer; // populated inside createMap

  constructor(
    private dataSrvc: Remotedata,
    public MStyle: MapStyleService,
    public MLayer: LayersService, // creates and caches static layers
    public evts: Events, // pubsub for modal forms etc,
    shared: Shared
  ) {
    super(evts, shared);

    // console.log('Hello from Mapservice');
    // NOTE: see https://github.com/proj4js/proj4js/issues/254
    // had to edit @types/proj4/index.d.ts: and set last line to "export default proj4;"
    proj4.defs('EPSG:32601', '+proj=utm +zone=1 +datum=WGS84 +units=m +no_defs');
    register(proj4);
  }

  public async renderFilteredSites(sites: any) {
    if (!sites || !sites.length) {
      return;
    }

    const gslyr = await this.MLayer.getSitesGsLayer();
    if (gslyr && gslyr.lyr && gslyr.vectorSource) {
      const src = gslyr.lyr.getSource();
      if (src) {
        const features = src.getFeatures();
        features.forEach((feature) => src.removeFeature(feature));
        src.addFeatures(_.map(sites, 'feature'));
      }
    }
  }

  public async filterSites(formValues: StatsQuery) {
    let filtered = [];
    const status = {
      errors: [],
      msgs: [],
      code: 200, // 200 ok see html status codes
    };

    // form to db fields mapping
    const flds = {
      // parameter: 'parameter', treated special so omit here
      bmpCategory: 'category',
      // siteType: 'site'
      siteType: 'dot_type',
    };

    const siteFeatures = this.getSiteFeatures();
    if (siteFeatures && siteFeatures.featsArray) {
      // 2. filter across all facets
      filtered = await this.filterData(flds, formValues, siteFeatures.featsArray);
      if (!filtered || !filtered.length) {
        status.code = 201;
        status.errors.push(
          'Not enough data. Please try a less restrictive query or other parameters'
        );
      }
    } else {
      status.code = 500;
      status.errors.push('Unable to fetch data. Please try again later');
    }

    return { status, filtered };
  }

  private async filterData(flds: any, formValues: StatsQuery, data: any[]) {
    if (!data || !data.length) {
      return [];
    }

    let filteredData = data;
    _.map(flds, (itm, key) => {
      if (
        formValues &&
        formValues[key] !== undefined &&
        formValues[key] !== null &&
        formValues[key] !== ''
      ) {
        // for consistency assume multiple values for all formvalues
        const filterBy =
          typeof formValues[key] === 'object' ? [...formValues[key]] : [formValues[key]];
        // for consistency assume any filter can have all and skip if filtering if all included in list
        if (filterBy && filterBy.length && filterBy.indexOf('All') === -1) {
          filteredData = filteredData.filter((row) => {
            for (const filter of filterBy) {
              if (row[itm] === filter) {
                return true;
              }
            }
            return false;
          });
        }
      }
    });

    // filter for aadt
    if (formValues && formValues.aadt && filteredData && filteredData.length) {
      const aadt: any = formValues.aadt;
      filteredData = _.filter(filteredData, (itm) => {
        return itm.aadt >= aadt.lower && itm.aadt <= aadt.upper;
      });
    }

    // filter for param is applicable
    // if filtering by param get sites that have that param
    let paramSitesDict: any = null; // create dict of sites to avoid quadratic time searching through array of sites
    if (formValues && formValues.parameter && filteredData && filteredData.length) {
      const paramSites = await this.dataSrvc.getSitesByParam(formValues.parameter);
      if (paramSites && paramSites.length) {
        paramSitesDict = {};
        paramSites.map((psite) => {
          paramSitesDict['b' + psite.bmp_id] = psite;
        });
        filteredData = _.filter(filteredData, (itm) => {
          return !paramSitesDict || (paramSitesDict && paramSitesDict[itm.bmp_id]);
        });
      }
    }

    return filteredData;
  }

  broadCastMapEvent(data: GsMapEvent) {
    this.evts.publish(data.type, data);
  }

  zoomToFeature(feat) {
    if (feat) {
      let coords = feat.getGeometry().getCoordinates();
      if (coords && coords[0] && coords[0].length) {
        coords = coords[0];
      }
      // uwrap again if needed for polygons
      if (coords && coords[0] && coords[0].length) {
        coords = coords[0];
      }
      if (coords && coords[0] && coords[0].length) {
        coords = coords[0];
      }
      // this.gsLocation.mapZoomToPosition(this.map, coords, 17);
      // select the feature once there. Select control must already be instantiated
      this.mySelectControl.getFeatures().clear(); // removes any previously selected items
      this.mySelectControl.getFeatures().push(feat);

      // coment below out if dont want to display popup autmatically on findfeature
      feat = feat.getProperties();
      const entity = feat.features ? feat.features[0].getProperties() : feat.getProperties();
      setTimeout(() => {
        if (entity) {
          this.popupOverLay.setPosition(coords);
        }
      }, 500);
    }
  }

  getSiteFeatures() {
    // return cached site features if filled
    if (
      this.GSFeaturesCache &&
      this.GSFeaturesCache.featsArray &&
      this.GSFeaturesCache.featsArray.length
    ) {
      return this.GSFeaturesCache;
    }
    this.siteFeaturesLayer = this.MLayer.getSitesLayer();
    if (this.siteFeaturesLayer) {
      const source = this.siteFeaturesLayer.getSource();
      const features = source.getFeatures();
      const featsDict = {};
      if (features && features.length) {
        let props, id, bmp_id, dot_type;
        const featsArray = _.map(features, (val) => {
          props = val.getProperties();

          // for clustered layer
          props = props.features ? props.features[0].getProperties() : props;
          if (props) {
            // for non-clustered layers if (props && (props.featureID || props.Alt_Name)) {
            id = 'siteID' + props.site_id || 'unknownSiteID';
            bmp_id = 'b' + props.bmp_id || 'unknownBMPID';
            dot_type = props.dot_type || 'unknowSiteType';
            featsDict[id] = {
              id,
              bmp_id,
              dot_type,
              siteID: id,
              feature: val,
              category: props.category || '',
              siteType: props.site_type || '',
            };
            return featsDict[id];
          }
        });
        this.GSFeaturesCache = { featsArray, featsDict };
        return this.GSFeaturesCache;
      }
      return null;
    }
  }

  getFeatures() {
    // return cached features if filled
    if (
      this.GSFeaturesCache &&
      this.GSFeaturesCache.featsArray &&
      this.GSFeaturesCache.featsArray.length
    ) {
      return this.GSFeaturesCache;
    }
    this.featuresLayer = this.MLayer.getFeatureLayer();
    if (this.featuresLayer) {
      const source = this.featuresLayer.getSource();
      const features = source.getFeatures();
      const featsDict = {};
      if (features && features.length) {
        let props, id;
        const featsArray = _.map(features, (val) => {
          props = val.getProperties();

          // for clustered layer
          props = props.features ? props.features[0].getProperties() : props;
          if (props && (props.featureID || props.Alt_Name)) {
            // for non-clustered layers if (props && (props.featureID || props.Alt_Name)) {
            id = props.featureID || props.Alt_Name;
            featsDict[id] = { id, feature: val };
            return featsDict[id];
          }
        });
        this.GSFeaturesCache = { featsArray, featsDict };
        return this.GSFeaturesCache;
      }
      return null;
    }
  }

  async getBMPSites() {
    return this.dataSrvc.getBMPSites();
  }

  toggelLegend() {
    this.showLegend = !this.showLegend;
    return this.showLegend;
  }

  async createMap(opts = null) {
    const container = (opts && opts.container) || document.getElementById('popup');
    const content = (opts && opts.content) || document.getElementById('popup-content');
    const closer = (opts && opts.closer) || document.getElementById('popup-closer');
    const popupOpts = { container, content, closer };
    const scaleLineControl = new ScaleLine();
    scaleLineControl.setUnits('metric'); // metric is default but included for readability

    // wait for layer.service to load geojson files
    await this.MLayer.initGenerateLayers(); // IMPORTANT !!
    const vectorLayers = _.values(this.MLayer.vectoreLayerCache);
    const baseLayers = _.values(this.MLayer.rasterLayerCache);
    const popupOverlay = this.createPopupOverlay(popupOpts);
    const center = [-95.7129, 37.0902];

    const map = new Map({
      layers: [
        ...baseLayers,
        ...vectorLayers,
        // upi.layer,
      ],
      controls: defaultControls().extend([
        scaleLineControl,
        // new FullScreen()
      ]),
      overlays: [popupOverlay],
      target: 'map',
      view: new View({
        center: fromLonLat(center),
        zoom: opts.initZoomLevel || 6,
      }),
    });

    map.addInteraction(this.getSelectControl());
    this.map = map;

    if (opts.mapElementRef) {
      this.map.setTarget(opts.mapElementRef.nativeElement);
    }

    _.map(this.MLayer.overlays, this.toggleLayer);
    _.map(this.MLayer.baseLayers, this.toggleLayer);

    setTimeout(() => {
      map.updateSize();

      // @todo find event based workflow
      setTimeout(() => {}, 1000);
    }, 100);
    return true;
  }

  getSelectControl() {
    const selectControl = new OlSelect({
      layers: (layer) => {
        let title = 'Unknown Layer';
        if (layer) {
          title = layer.get('title');
          if (
            !title ||
            title === 'Area of Interest' ||
            title === 'Cultural Resource Buffer' ||
            title === 'Unknown Layer'
          ) {
            return false;
          }
          return true;
        }
        return false;
      },
      style: (feature, resolution) => {
        let str = '';
        let feat = feature;
        if (feat.get('features')) {
          feat = feat.get('features')[0];
        }
        const entity = feat.getProperties();
        // for clusters
        if (entity) {
          str = entity.entityType;
        }
        return this.MStyle.mapFeatureStyles.Selected;
      },
    });
    selectControl.on('select', async (e) => {
      if (e.target && e.target.getFeatures) {
        const features = e.target.getFeatures();
        if (this.isCluster(features.item(0))) {
        } else if (features && features.item(0)) {
          const feats = features.item(0).get('features') || features.item(0);
          let feat = feats;
          if (feats && feats.length) {
            feat = feats[0];
          }
          if (feat && feat.values_) {
            let entity = feat.getProperties();
            // fetch popup contents
            const popscontent =
              entity && entity.bmp_id ? await this.dataSrvc.getPopupContent(entity.bmp_id) : {};
            entity = { ...entity, ...popscontent };
            let coords = feat.getGeometry().getCoordinates();
            if (coords && coords[0] && coords[0].length) {
              coords = coords[0];
            }
            // uwrap again if needed for polygons
            if (coords && coords[0] && coords[0].length) {
              coords = coords[0];
            }
            if (coords && coords[0] && coords[0].length) {
              coords = coords[0];
            }
            const pdfID = this.pad(entity.pdf_id, 5);
            this.selectedSite = {
              ...entity,
              summaryReportLink: `http://www.bmpdatabase.org/Database/pdf/DESCP/${pdfID}--DESCP.pdf`,
              flowReportLink: `http://www.bmpdatabase.org/Database/pdf/SummaryOfPrecipAndVolume/Precip_Volume_${pdfID}.pdf`,
              cleanParams: this.tranformParams(entity.parameters || null),
            };
            this.popupOverLay.setPosition(coords);
          }
        }
      }
    });
    this.mySelectControl = selectControl;
    return selectControl;
  }

  public unSelectMapFeature() {
    if (!this.mySelectControl) {
      return false;
    }
    this.mySelectControl.getFeatures().clear();
    return true;
  }

  private tranformParams(mapDataRow: any) {
    if (!mapDataRow) {
      return [];
    }

    const rslts = [];
    _.map(mapDataRow, (row, groupKey) => {
      rslts.push({ paramGroup: groupKey, params: row });
    });
    return rslts;
  }

  private isCluster(feature) {
    if (!feature || !feature.get('features')) {
      return false;
    }
    return feature.get('features').length > 1;
  }

  // returns layers so can be toggles on/off
  public getMapLayers() {
    const overlays = this.MLayer.getOverlays();
    const baselayers = this.MLayer.getBaseLayers();
    return {
      overlays,
      baselayers,
    };
  }

  closePopUp() {
    if (this.popupOverLay && this.popupOverLay.setPosition) {
      this.popupOverLay.setPosition(undefined);
    }
    this.selectedSite = null;
  }

  createPopupOverlay(opts: { container; content }) {
    this.popupOverLay = new Overlay({
      element: opts.container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    return this.popupOverLay;
  }

  toggleLayer(itm) {
    if (itm && itm.lyr) {
      itm.lyr.setVisible(itm.isChecked);
    }
  }

  setLayerVisibility(layer: GsLayer, visibility: boolean) {
    this.MLayer.setLayerVisibility(layer, visibility);
  }
}
