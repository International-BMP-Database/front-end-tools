import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormtaskbarComponent } from './formtaskbar.component';

describe('FormtaskbarComponent', () => {
  let component: FormtaskbarComponent;
  let fixture: ComponentFixture<FormtaskbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormtaskbarComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormtaskbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
