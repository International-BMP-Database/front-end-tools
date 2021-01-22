import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaplegendComponent } from './maplegend.component';

describe('MaplegendComponent', () => {
  let component: MaplegendComponent;
  let fixture: ComponentFixture<MaplegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaplegendComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaplegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
