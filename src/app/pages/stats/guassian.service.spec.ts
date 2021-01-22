import { TestBed } from '@angular/core/testing';

import { GuassianService } from './guassian.service';

describe('GuassianService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GuassianService = TestBed.get(GuassianService);
    expect(service).toBeTruthy();
  });
});
