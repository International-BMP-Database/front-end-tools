import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsformComponent } from './statsform.component';

describe('StatsformComponent', () => {
  let component: StatsformComponent;
  let fixture: ComponentFixture<StatsformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatsformComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
