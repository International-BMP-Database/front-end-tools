import { TestBed } from '@angular/core/testing';

import { AbstractengineService } from './abstractengine.service';

describe('AbstractengineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AbstractengineService = TestBed.get(AbstractengineService);
    expect(service).toBeTruthy();
  });
});
