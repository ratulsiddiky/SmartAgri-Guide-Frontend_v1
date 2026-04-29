import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgriMarkets } from './agri-markets';

describe('AgriMarkets', () => {
  let component: AgriMarkets;
  let fixture: ComponentFixture<AgriMarkets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgriMarkets],
    }).compileComponents();

    fixture = TestBed.createComponent(AgriMarkets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
