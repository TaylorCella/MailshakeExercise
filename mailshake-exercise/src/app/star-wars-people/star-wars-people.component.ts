import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, takeUntil, pluck } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

export interface peopleModel {
  name: string;
  world: string;
  dob: string;
  films: string[];
}

export interface serverResponse {
  count: number;
  next: string;
  previous?: string;
  results: [{}];
}

@Component({
  selector: 'app-star-wars-people',
  templateUrl: './star-wars-people.component.html',
  styleUrls: ['./star-wars-people.component.scss']
})
export class StarWarsPeopleComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource();
  private unsubscribe: Subject<void> = new Subject();
  displayedColumns: string[] = ['name', 'homeWorld', 'birthYear', 'films'];
  public test: peopleModel[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getData('https://swapi.dev/api/people/');
  }

  // ngAfterViewInit() {
  //   this.dataSource.sort = this.sort;
  // }

  getData(url?: string) {
    this.http.get<serverResponse>(url).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          this.test.push({name: res['name'], world: res['homeworld'], dob: res['birth_year'], films: res['films']})
        });
        if(firstResponse.next != null) {
          this.getData(firstResponse.next);
        }
        else {
          this.dataSource.data = this.test;
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
