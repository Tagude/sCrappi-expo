import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMarcame } from './home-marcame';

describe('HomeMarcame', () => {
  let component: HomeMarcame;
  let fixture: ComponentFixture<HomeMarcame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMarcame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMarcame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
