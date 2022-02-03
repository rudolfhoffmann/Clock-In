import { TestBed } from '@angular/core/testing';

import { GlobalFunctionsService } from './global-functions.service';

describe('GlobalFunctionsService', () => {
  let service: GlobalFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
