import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgmapComponent } from './imgmap.component';

describe('ImgmapComponent', () => {
  let component: ImgmapComponent;
  let fixture: ComponentFixture<ImgmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgmapComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
