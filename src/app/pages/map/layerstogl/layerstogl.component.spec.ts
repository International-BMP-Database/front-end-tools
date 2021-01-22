import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerstoglComponent } from './layerstogl.component';

describe('LayerstoglComponent', () => {
  let component: LayerstoglComponent;
  let fixture: ComponentFixture<LayerstoglComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerstoglComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerstoglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
