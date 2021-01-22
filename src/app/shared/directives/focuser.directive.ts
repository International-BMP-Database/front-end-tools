import { Directive, Renderer, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocuser]'
})
export class FocuserDirective implements OnInit {

  constructor(public renderer: Renderer, public elementRef: ElementRef) { }

  ngOnInit() {
    // need to be on input iteself
    const elem = this.elementRef.nativeElement;
    // const elem = this.elementRef.nativeElement.querySelector('input');
    setTimeout(() => {
      // delay required or ionic styling gets finicky
      this.renderer.invokeElementMethod(elem, 'focus', []);
    }, 0);
  }

}

