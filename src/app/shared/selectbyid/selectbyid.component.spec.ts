import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectbyidComponent } from './selectbyid.component';

describe('SelectbyidComponent', () => {
  let component: SelectbyidComponent;
  let fixture: ComponentFixture<SelectbyidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectbyidComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectbyidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
