import { Injectable } from '@angular/core';
import {
  AlertController,
  ToastController,
  LoadingController,
  ModalController,
  ActionSheetController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertObj } from './models';
import * as moment from 'moment';

const APPROOTURL = 'https://dot.bmpdatabase.org/';

@Injectable({
  providedIn: 'root',
})
export class Shared {
  selectedSite: any;
  recordCount: any = null; // tracks record counts as user filters data in the ui

  mapables: any = null; // @TODO make obsolete;
  loading: any;
  loadingActive = false; // set to true when busy loading is active
  constructor(
    public actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) // private camera: CameraService,
  {
    console.log('Hello Shared Provider' + moment().unix());

    // @TODO: comment out for production
    window.addEventListener('unhandledrejection', (event) => {
      // the event object has two special properties:
      console.log(event.promise); // [object Promise] - the promise that generated the error
      console.log(event.reason); // Error: Whoops! - the unhandled error object
    });
  }

  async presentLoading(duration: number = 100, message = 'Please wait...') {
    // await this.dismissLoading(); // dismiss before starting another one
    if (this.loadingActive) {
      return true;
    } // avoid duplicate loading modals

    this.loading = await this.loadingCtrl.create({
      message,
      duration,
    });
    await this.loading.present();
    this.loadingActive = true;
    return true;
  }

  async dismissLoading() {
    try {
      if (this.loadingActive) {
        await this.loading.dismiss();
      }
    } catch (err) {
      console.log(err);
      return false;
    }
    this.loadingActive = false;
    return false;
  }

  async presentToast(message: string, dismissalTime: number = 2000) {
    const toast = await this.toastCtrl.create({
      message,
      duration: dismissalTime,
    });
    toast.present();
  }

  async presentAlert(title: string, subtitle: string, message = '') {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: subtitle,
      message,
      buttons: ['Dismiss'],
    });
    alert.present();
  }

  async presentAlertObj(Obj: AlertObj) {
    const alert = await this.alertCtrl.create({
      header: Obj.title,
      subHeader: Obj.subtitle,
      message: Obj.message,
      buttons: ['Dismiss'],
    });
    alert.present();
  }

  navigateToUrl(url: string) {
    console.log('inside shared navigateToUrl-', url);
    return this.router.navigateByUrl(url);
  }

  goHome() {
    return this.navigateToUrl('/home');
  }
  goFeatHome() {
    return this.navigateToUrl('/features/home');
  }

  async presentAlertMultipleButtons(
    message: string,
    title: string = null,
    subtitle: string = null,
    buttonArr: Array<string> = null
  ) {
    const alert = await this.alertCtrl.create({
      header: title || '',
      subHeader: subtitle || '',
      message,
      buttons: buttonArr || ['Ok', 'Cancel'],
    });

    await alert.present();
  }

  async presentAlertConfirm(
    message: string,
    okayCBFxn: any,
    cancelCBFxn: any,
    title: string = null,
    subtitle: string = null
  ) {
    const alert = await this.alertCtrl.create({
      header: title || 'Confirm!',
      message,
      subHeader: subtitle || '',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            cancelCBFxn();
          },
        },
        {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            okayCBFxn();
          },
        },
      ],
    });

    await alert.present();
  }

  async presentModal(componentToShowInModal, owner, payload: any = null, pageTitle = '') {
    const modal = await this.modalController.create({
      component: componentToShowInModal,
      // enableBackdropDismiss: false,
      showBackdrop: true,
      componentProps: {
        pageTitle,
        owner,
        payload: {
          photo: payload,
          cancelEvt: () => modal.dismiss(),
          deleteEvt: () => {
            payload.deleted = true;
            // console.log(payload, that.photos);
            modal.dismiss();
          },
          saveEvt: (itm) => {
            console.log(itm);
            if (itm && payload) {
              payload = Object.assign(payload, itm);
            }
            // @TODO: user might loose their changes if they forget to save their form
            modal.dismiss();
          },
        },
      },
    });
    return await modal.present();
  }

  // utility fxns
  sentenceCase(str) {
    if (str === null || str === '') {
      return false;
    } else {
      str = str.toString();
    }
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
  }

  openInNewTab(url) {
    const win = window.open(url, '_blank');
    win.focus();
  }

  public openHelpPage() {
    this.openInNewTab(`${APPROOTURL}?page_id=760`);
  }
}
