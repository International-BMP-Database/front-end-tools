import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MapService } from '../map.service';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { GsLayer } from '../layers.service';

@Component({
  selector: 'app-layerstogl',
  templateUrl: './layerstogl.component.html',
  styleUrls: ['./layerstogl.component.scss'],
})
export class LayerstoglComponent implements OnInit, OnDestroy {
  pageTitle = 'Toggle Layer Visibility';
  @Input() payload = {
    overlays: [],
    baselayers: [],
  };
  @Output() actionEvt = new EventEmitter();
  public form = new FormGroup({});
  public model: any;
  constructor(public engine: MapService, public fb: FormBuilder) {}

  ngOnInit() {
    console.log('iniside layerstogl component.ngOnInit payload-', this.payload);
    this.prepMainForm();
  }

  ngOnDestroy(): void {
    this.payload = null;
  }

  get frmOverlays() {
    return this.form.get('overlays') as FormArray;
  }
  get frmBaseLayers() {
    return this.form.get('baselayers') as FormArray;
  }

  prepMainForm() {
    this.form = this.fb.group({
      overlays: this.fb.array([]),
      baselayers: this.fb.array([]),
    });

    // create space for overlays
    let subfrm = this.form.get('overlays') as FormArray;
    this.payload.overlays.map((itm) => {
      this.addLayerToFrm(subfrm, itm); // user will select qctypes in the form
    });

    // create space for baselayers
    subfrm = this.form.get('baselayers') as FormArray;
    this.payload.baselayers.map((itm) => {
      this.addLayerToFrm(subfrm, itm); // user will select qctypes in the form
    });

    this.form.valueChanges.subscribe((x) => this.formValueChanges(x));
  }

  addLayerToFrm(subfrm: FormArray, itm: any) {
    const analytes = this.fb.group({
      id: [itm.id],
      val: [itm.label],
      isChecked: [itm.isChecked],
    });
    subfrm.push(analytes);
  }

  formValueChanges(data) {
    if (data) {
      // console.log(data);
      data.overlays.map((itm) => {
        this.toggleLayer(this.payload.overlays[itm.id], itm.isChecked);
      });

      data.baselayers.map((itm) => {
        this.toggleLayer(this.payload.baselayers[itm.id], itm.isChecked);
      });
    }
  }

  toggleLayer(layer: GsLayer, val: boolean) {
    this.engine.setLayerVisibility(layer, val);
  }

  actionH(isCancel = false) {
    this.actionEvt.emit(this.payload);
    // broacast event
    this.engine.broadCastMapEvent({
      type: 'Layers-Toggle',
      data: this.payload,
      senderID: 'Layers-Toggle',
    });
  }

  cancelBtnH() {
    this.actionH(true);
  }

  closeModal() {
    this.actionH(true);
  }
}
