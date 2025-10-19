import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlacPlayerComponent } from './flac-player.component';

describe('FlacPlayerComponent', () => {
  let component: FlacPlayerComponent;
  let fixture: ComponentFixture<FlacPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlacPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlacPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
