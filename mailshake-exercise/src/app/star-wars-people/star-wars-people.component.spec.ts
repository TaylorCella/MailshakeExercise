import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarWarsPeopleComponent } from './star-wars-people.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StarWarsPeopleComponent', () => {
  let component: StarWarsPeopleComponent;
  let fixture: ComponentFixture<StarWarsPeopleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarWarsPeopleComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarWarsPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger setup methods', () => {
    const spyOnGetFilms = spyOn<any>(component, 'getFilms');
    const spyOnGetWorlds = spyOn<any>(component, 'getWorlds');

    component.ngOnInit();

    expect(spyOnGetFilms).toHaveBeenCalled();
    expect(spyOnGetWorlds).toHaveBeenCalled();
  });

  it('should display spinner on initial load', () => {
    const spinner = fixture.nativeElement.querySelector('mat-spinner') as HTMLElement;

    component.ngOnInit();

    expect(spinner).toBeDefined();
  });
});
