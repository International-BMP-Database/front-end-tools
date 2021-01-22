import { TestBed } from '@angular/core/testing';

import { GsstatsService } from './gsstats.service';

describe('GsstatsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GsstatsService = TestBed.get(GsstatsService);
    expect(service).toBeTruthy();
  });
});
