import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationViewerComponent } from './citation-viewer.component';

describe('CitationViewerComponent', () => {
  let component: CitationViewerComponent;
  let fixture: ComponentFixture<CitationViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CitationViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CitationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
