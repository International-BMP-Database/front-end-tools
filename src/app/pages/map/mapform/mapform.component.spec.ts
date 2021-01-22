import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapformComponent } from './mapform.component';

describe('MapformComponent', () => {
  let component: MapformComponent;
  let fixture: ComponentFixture<MapformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapformComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
