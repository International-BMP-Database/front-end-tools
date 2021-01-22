import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectwellinventComponent } from './selectwellinvent.component';

describe('SelectwellinventComponent', () => {
  let component: SelectwellinventComponent;
  let fixture: ComponentFixture<SelectwellinventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectwellinventComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectwellinventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
