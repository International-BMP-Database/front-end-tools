import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { GsMapEvent, GsFormEvent, GsButton } from 'src/app/core/services/models';
import * as _ from 'lodash';
import { MapService } from './map.service';
import { LayerstoglComponent } from './layerstogl/layerstogl.component';
import { SelectbyidComponent } from '@shared/selectbyid/selectbyid.component';
import * as moment from 'moment';
import { MaptaskbarComponent } from '@shared/maptaskbar/maptaskbar.component';
import { ActivatedRoute } from '@angular/router';
import { AbstractPageComponent } from '@pages/AbstractPageComponent';
import { Config } from '@core/config';
import { Shared } from '@core/shared';
import { StatsService } from '@pages/stats/stats.service';
import { MaplegendComponent } from './maplegend/maplegend.component';

const COMPONENTNAME = 'Map Page';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage extends AbstractPageComponent implements OnInit, AfterViewInit, OnDestroy {
  layersInfo: any;
  @ViewChild('mapTaskBar') taskBar: MaptaskbarComponent;
  @ViewChild('maplegend') legend: MaplegendComponent;
  public openPanel = -1;
  public pageTitle = 'Map';
  public COLORS = this.engine.COLORS;

  public showLegend = false;
  public componentID = 'page_map'; // used to differentiate pub/sub events
  public BMPSites: any[] = [];
  segmentID = moment().unix();
  stopFollow; // interval handle for follow mode on map
  beepstop = false;
  utilLocateStartGracePeriod = 5000; // 5 seconds
  utilLocateStartGracePeriodTID = -1; // timer id so can cancel
  showTrackingButtons = true;
  utilLocateInProgress = false;
  showMenuIcon = false;
  public taskbarOpts = {
    followMode: false,
    showTrackingButtons: false,
    transectInProgress: false,
  };

  constructor(
    public statsEngine: StatsService,
    private route: ActivatedRoute,
    public actionEvents: Events, // listen for events from modal forms
    public Cfg: Config,
    public shared: Shared,
    public engine: MapService,
    public modalCtrl: ModalController
  ) {
    super(actionEvents, engine, Cfg, shared, modalCtrl);

    console.log('Hellow from ', COMPONENTNAME);
  }

  async ngOnInit() {
    if (this.route && this.route.snapshot && this.route.snapshot.data) {
      const routeData = this.route.snapshot.data;
      this.pageTitle = routeData.pageTitle;
      this.taskbarOpts = routeData.taskbarOpts;

      console.log('inside map.page route data->', routeData);
      this.BMPSites = await this.engine.getBMPSites();
    }
  }
  ngOnDestroy() {}

  async ngAfterViewInit() {
    this.layersInfo = this.engine.getMapLayers();
  }

  public ionViewDidEnter(): void {
    this.subToCommonEvents();
    // subscribe to generic map events
    this.actionEvents.subscribe(this.engine.mapEventTypes.legendHide.label, (data: GsMapEvent) =>
      this.handleMapEvent(data)
    );
    this.actionEvents.subscribe(this.engine.mapEventTypes.legendShow.label, (data: GsMapEvent) =>
      this.handleMapEvent(data)
    );
    this.actionEvents.subscribe(this.engine.mapEventTypes.layersToggle.label, (data: GsMapEvent) =>
      this.handleMapEvent(data)
    );
    this.actionEvents.subscribe(this.engine.mapEventTypes.closeModal.label, (data: GsMapEvent) =>
      this.handleMapEvent(data)
    );

    // subscribe to generic events used for feature selection
    this.frmEvents.subscribe(this.engine.eventTypes.itmSelect.label, (data: GsFormEvent) =>
      this.handleItmSelecEvent(data)
    );
  }

  public ionViewDidLeave(): void {
    this.unsubToCommonEvents();
  }

  public setOpenPanel(panelIndex = 0) {
    if (panelIndex === 2 || panelIndex === 3) {
      const layers = this.engine.getMapLayers();
      this.openModal(LayerstoglComponent, layers);
      setTimeout(() => {
        this.openPanel = -1;
      }, 1000);

      return;
    }
    this.openPanel = panelIndex;
  }

  showLayers() {
    const layers = this.engine.getMapLayers();
    this.openModal(LayerstoglComponent, layers);
  }

  public async querySubmitH($event) {
    const temp = await this.engine.filterSites($event);
    if (temp && temp.status && temp.status.code === 200) {
      this.BMPSites = temp.filtered;
      this.engine.renderFilteredSites(temp.filtered);
      this.legend.refreshBMPSiteCounts(temp.filtered);
      this.shared.presentAlert(
        'Success',
        `${temp.filtered.length} sites found. You may have to zoom out to see all found sites`
      );
    } else {
      this.shared.presentAlert('Warning', `${temp.status.errors.join('. ')}`);
    }
    this.shared.dismissLoading();
  }

  public queryCancelH($event) {
    console.log('Inside StatsPage query canceled', $event);
  }

  public queryResetH($event) {
    this.querySubmitH($event);
  }

  async handleItmSelecEvent(data: GsFormEvent) {
    // 1. validate the data
    if (data && data.data) {
      if (!data.owner || data.owner !== this.componentID) {
        return false;
      }
      this.closeModal();
      if (data.data.feature) {
        this.engine.zoomToFeature(data.data.feature);
      }
    }
  }

  public async mapTaskBarH(evt: GsButton) {
    switch (evt.idx) {
      case 'find-feature':
        const temp = await this.engine.getFeatures();
        if (temp && temp.featsArray) {
          this.openModal(SelectbyidComponent, temp.featsArray, 'Select Feature');
        }
        break;
      case 'show-hide-layers':
        const layers = this.engine.getMapLayers();
        this.openModal(LayerstoglComponent, layers);
        break;
      case 'show-hide-legend':
        this.showLegend = this.engine.toggelLegend();
        break;
      default:
        console.log('formTaskBarH itm not understood in abstract form class');
    }
    return true;
  }

  async handleMapEvent(data: GsMapEvent) {
    console.log('inside map page handleMapEvent', data);
    // 1. validate the data
    if (data && data.data) {
      switch (data.type) {
        case this.engine.mapEventTypes.closeModal.label:
        // fall thru and close modal
        default:
        // do nothing
      }
    }
    // 2. close the modal
    this.closeModal();
    return true;
  }

  async openModal(comp: any, payload = null, pageTitle = '') {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      backdropDismiss: true,
      component: comp,
      componentProps: {
        pageTitle,
        payload,
        owner: this.componentID,
      },
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      if (detail !== null) {
        console.log('The result:', detail.data);
      }
    });

    await modal.present();
  }

  public openHelpPage() {
    this.shared.openHelpPage();
  }
}
