import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { GsButton } from 'src/app/core/services/models';

@Component({
  selector: 'app-formtaskbar',
  templateUrl: './formtaskbar.component.html',
  styleUrls: ['./formtaskbar.component.scss'],
})
export class FormtaskbarComponent implements OnInit {
  @Input() showSampleSelect = false;
  @Input() showSelectDrinkingWell = false;
  // @Input() showNewLocation = true;
  @Output() btnClickEvt = new EventEmitter();
  // @Input() btnVisibility = {}; // format {'feat-info':true} can be sparse
  public btns: Array<GsButton> = [
    { // 0 
      idx: 'feat-info', label: 'Feature Info', icon: 'information-circle-outline',
      show: true, iconSlot: 'icon-only', showText: false
    }, { // 1
      idx: 'select-sampl', label: 'Select Sample', icon: 'add-circle-outline',
      show: this.showSampleSelect, iconSlot: 'end', showText: true
    }, { // 2
      idx: 'select-loc', label: 'New Sample', icon: 'add-circle-outline',
      show: this.showSampleSelect, iconSlot: 'end', showText: true
    }, { // 3
      idx: 'select-loc', label: 'Select Loc', icon: 'add-circle-outline',
      show: true, iconSlot: 'end', showText: true
    },
    { // 4
      idx: 'select-drinkingwell', label: 'Select Drinking Water Well', icon: 'add-circle-outline',
      show: this.showSelectDrinkingWell, iconSlot: 'end', showText: true
    }, { // 5
      idx: 'add-drinkingwell', label: 'New Drinking Water Well', icon: 'add-circle-outline',
      show: this.showSelectDrinkingWell, iconSlot: 'end', showText: true
    },
    { // 6
      idx: 'add-loc', label: 'New Loc', icon: 'add-circle-outline',
      show: true, iconSlot: 'end', showText: true
    },
    { // 7
      idx: 'map', label: 'Map', icon: 'globe',
      show: true, iconSlot: 'icon-only', showText: false
    },
  ];
  constructor() { }

  ngOnInit() {

    if (this.showSampleSelect) {
      this.btns[1].show = true;
      this.btns[2].show = true;
      this.btns[3].show = false;
      this.btns[6].show = true;
    }
    if (this.showSelectDrinkingWell) {
      this.btns[1].show = false;
      this.btns[2].show = false;
      // this.btns[3].show = false;
      this.btns[4].show = false;
      this.btns[5].show = false;
      // this.btns[6].show = false;
    }
  }

  btnH(btn) {
    this.btnClickEvt.emit(btn);
  }

}
