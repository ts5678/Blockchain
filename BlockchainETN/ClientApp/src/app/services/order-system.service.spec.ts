import { TestBed, inject } from '@angular/core/testing';

import { OrderSystemService } from './order-system.service';

describe('OrderSystemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderSystemService]
    });
  });

  it('should be created', inject([OrderSystemService], (service: OrderSystemService) => {
    expect(service).toBeTruthy();
  }));
});
