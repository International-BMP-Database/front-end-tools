import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-gsbigbutton',
  templateUrl: './gsbigbutton.component.html',
  styleUrls: ['./gsbigbutton.component.scss'],
})
export class GsbigbuttonComponent implements OnInit {

  @Input() payload = { label: '', icon: 'star', imgsrc: '' };
  // @Output() click = new EventEmitter();

  constructor() { }

  ngOnInit() { }


  btnClickH($evt) {
    // this.click.emit($evt);
  }

}
