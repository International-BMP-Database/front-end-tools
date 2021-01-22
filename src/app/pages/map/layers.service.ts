import { Injectable } from '@angular/core';
import XYZ from 'ol/source/XYZ.js';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Tile as TileLayer, Vector as VectorLayer, Group as GroupedLayers } from 'ol/layer.js';
import { Cluster, OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { defaults as defaultControls, Attribution } from 'ol/control.js';
import * as _ from 'lodash';
import { MapStyleService } from './styles.service';
import { Entity } from '@core/models';
import { Remotedata } from '@core/remotedata';

const MAPPROJECTION = 'EPSG:3857';
const WGS84 = 'EPSG:4326';
const VECTORDATADIR = 'assets/data/geojson/';
const CLUSTDIST = 20;

export class GsLayer {
  id: number;
  isChecked: boolean;
  lyr: TileLayer | VectorLayer;
  title: string;
  projection?: string;
  cluster?: boolean;
  clusterSource?: any;
  vectorSource?: any;
  clusterDist?: number;
}
export class GsTileLayer extends GsLayer {
  lyr: TileLayer;
  bounds: number[];
  mapMinZoom: number;
  mapMaxZoom: number;
  attributions: string;
  url: string;
  basemapExtent?: any;
}
@Injectable({
  providedIn: 'root',
})
export class LayersService {
  // most of the content of this class is private outside world reads from cache
  public rasterLayerCache: any = {}; // cache layers for performance
  public vectoreLayerCache: any = {}; // cache layers for performance

  public baseLayers: { [name: string]: GsTileLayer } = {
    esri: {
      id: 0,
      isChecked: false,
      lyr: null,
      title: 'Satelite Imagery',
      bounds: null,
      mapMinZoom: 1,
      mapMaxZoom: 16,
      attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
      url: 'not needed',
    },
    osm: {
      id: 1,
      isChecked: true,
      lyr: null,
      title: 'Open Street Map',
      bounds: null,
      mapMinZoom: 1,
      mapMaxZoom: 20,
      attributions: 'Open Street Maps',
      url: 'not needed',
    },
  };

  public overlays: { [name: string]: GsLayer } = {
    BMPSites: {
      id: 0,
      title: 'BMP Sites',
      isChecked: true,
      lyr: null,
      cluster: false,
      clusterDist: 3,
      clusterSource: null,
      vectorSource: null,
    },
  };

  public userPositionInfo = {
    layer: null,
    positionFeature: null,
    accuracyFeature: null,
  };

  constructor(private dataSrvc: Remotedata, public MStyle: MapStyleService) {
    // generate and cache layers
    this.initGenerateLayers(); // also call in map.service so map can wait for layers to load
  }

  private async getBMPSitesLayer() {
    // dont cache features if (this.vectoreLayerCache['RealFeatures']) { return this.vectoreLayerCache['RealFeatures']; }
    const gslayer = this.overlays.BMPSites;
    const bmpSites = await this.dataSrvc.getBMPSites();
    const geojsonObjs = this.createMapFeaturesFromLocationEntity(bmpSites);
    const tempLayer = this.createNonClusteredLayerFromGeoJSON(
      gslayer,
      geojsonObjs,
      'BMPSites',
      'BMP Sites'
    );

    this.vectoreLayerCache.BMPSites = tempLayer; // must save it here to display on the map
    return tempLayer;
  }

  public async getXYZXYZEsriTileLayer(layerKey: string) {
    const layer =
      this.rasterLayerCache[layerKey] ||
      (await this.createXYZEsriTileLayer(this.baseLayers[layerKey]));
    this.toggleLayer(layer);
    this.rasterLayerCache[layerKey] = layer;
    this.baseLayers[layerKey].lyr = layer;
    return layer;
  }

  private async createXYZEsriTileLayer(opts: GsTileLayer) {
    // The tile size supported by the ArcGIS tile service.
    const tileSize = 512;

    const urlTemplate =
      'https://services.arcgisonline.com/arcgis/rest/services/' +
      'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}';
    const layer = new TileLayer({
      title: opts.title,
      source: new XYZ({
        attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
        maxZoom: 16,
        projection: 'EPSG:4326',
        tileSize,
        tileUrlFunction: (tileCoord) => {
          return urlTemplate
            .replace('{z}', (tileCoord[0] - 1).toString())
            .replace('{x}', tileCoord[1].toString())
            .replace('{y}', (-tileCoord[2] - 1).toString());
        },
        wrapX: true,
      }),
    });
    return layer;
  }

  private async getVectorLayerFromGsLayer(layerKey: string) {
    if (this.vectoreLayerCache[layerKey]) {
      return this.vectoreLayerCache[layerKey];
    }

    try {
      const itm = this.overlays[layerKey];
      const layer = this.createLayerFromGsLayer(layerKey, itm);
      this.toggleLayer(layer);
      this.vectoreLayerCache[layerKey] = layer;
      this.overlays[layerKey].lyr = layer;
      return layer;
    } catch (err) {
      console.log('An err occured while trying to fetch -', layerKey);
      return null;
    }
  }

  private createLayerFromGsLayer(entityType: string, obj: GsLayer, zIndex: number = null) {
    const source = new VectorSource({
      url: `${VECTORDATADIR}${entityType}.geojson`,
      format: new GeoJSON(),
    });
    const clusterSource = new Cluster({
      distance: obj.clusterDist || CLUSTDIST,
      source,
      geometryFunction: (feature) => {
        const geom = feature.getGeometry();
        if (geom.getType() === 'Point') {
          return geom;
        } else if (geom.getType() === 'Polygon') {
          return geom.getInteriorPoint();
        } else if (geom.getType() === 'MultiPolygon') {
          return geom.getPolygon(0).getInteriorPoint();
        }
        return null;
      },
    });
    const vectorLayer = new VectorLayer({
      source: obj.cluster ? clusterSource : source,
      title: obj.title,
      style: this.MStyle.styleFunctionEntityType(obj, entityType),
    });

    if (zIndex) {
      vectorLayer.setZIndex(zIndex);
    }
    obj.vectorSource = source;
    obj.clusterSource = clusterSource;
    return vectorLayer;
  }

  private createMapFeaturesFromLocationEntity(locs: Entity[], sourceProjection = MAPPROJECTION) {
    const tempFeatures = [];
    const geojsonFeatCollTemplate = {
      type: 'FeatureCollection',
      name: 'Locations',
      crs: {
        type: 'name',
        properties: {
          name: WGS84,
        },
      },
      features: [],
    };
    _.map(locs, (val, idx) => {
      if (val.latitude !== undefined && val.longitude !== undefined) {
        val.label = val.label || 'unlabeled';
        tempFeatures.push({
          type: 'Feature',
          properties: val,
          geometry: {
            type: 'Point',
            coordinates: [+val.longitude, +val.latitude],
          },
        });
      }
    });
    geojsonFeatCollTemplate.features = tempFeatures;
    return geojsonFeatCollTemplate;
  }

  private createNonClusteredLayerFromGeoJSON(
    obj: GsLayer,
    geojsonObjs,
    entityType: string,
    layerTitle = '',
    layerProjection = MAPPROJECTION,
    zIndex: number = null
  ) {
    const GJ = new GeoJSON();
    const vectorSource = new VectorSource({
      features: GJ.readFeatures(geojsonObjs, {
        dataProjection: WGS84,
        featureProjection: MAPPROJECTION,
      }),
    });
    const vectorLayer = new VectorLayer({
      title: layerTitle || 'Unknown Layer',
      source: vectorSource,
      style: this.MStyle.styleFunctionEntityType(obj, entityType),
    });
    if (zIndex) {
      vectorLayer.setZIndex(zIndex);
    }
    obj.vectorSource = vectorSource;
    return vectorLayer;
  }

  // begin public api
  public async initGenerateLayers() {
    // generate base layers and store in layer cache
    const proms1: any[] = _.map(this.baseLayers, async (itm, key) => {
      if (key === 'osm') {
        itm.layer = this.getOSMLayer();
      } else if (key === 'esri') {
        itm.layer = this.getXYZXYZEsriTileLayer(key);
      }
      return itm;
    });

    // generate vector static layers and store in layer cache
    // uses key as entityType
    const proms2: any[] = _.map(this.overlays, async (itm, entityType) => {
      if (entityType === 'BMPSites') {
        itm.lyr = await this.getBMPSitesLayer();
      } else {
        itm.lyr = await this.getVectorLayerFromGsLayer(entityType);
      }
    });
    await Promise.all([...proms1, ...proms2]);
    return true;
  }

  public async getSitesGsLayer() {
    if (
      this.vectoreLayerCache.BMPSites === undefined ||
      this.vectoreLayerCache.BMPSites.length < 1
    ) {
      await this.dataSrvc.getBMPSites();
    }

    return this.overlays.BMPSites;
  }

  public getSitesLayer() {
    return this.overlays.BMPSites.lyr;
  }

  public getFeatureLayer() {
    return this.overlays.RealFeatures.lyr;
  }

  public getOSMLayer() {
    const layerKey = 'osm';
    let osm;
    if (this.rasterLayerCache[layerKey]) {
      return this.rasterLayerCache[layerKey];
    }
    osm = new TileLayer({
      source: new OSM(),
    });

    this.baseLayers[layerKey].lyr = osm;
    this.rasterLayerCache[layerKey] = osm;
    this.toggleLayer(this.baseLayers[layerKey]);
    return osm;
  }

  public toggleLayer(itm: TileLayer | VectorLayer) {
    if (itm && itm.lyr) {
      itm.lyr.setVisible(itm.isChecked);
    }
  }

  public setLayerVisibility(layer: GsLayer, visibility: boolean) {
    let tempLayer = _.find(this.overlays, { title: layer.title });
    if (!tempLayer) {
      tempLayer = _.find(this.baseLayers, { title: layer.title });
    }

    if (tempLayer) {
      tempLayer.lyr.setVisible(visibility);
      tempLayer.isChecked = visibility;
    }
  }

  public getOverlays() {
    return _.filter(this.overlays, (x) => x.lyr);
  }

  public getBaseLayers() {
    return _.filter(this.baseLayers, (x) => x.lyr);
  }
}
