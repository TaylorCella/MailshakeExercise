import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

export interface peopleModel {
  name: string;
  world: string;
  dob: Date;
  film: string
}

@Component({
  selector: 'app-star-wars-people',
  templateUrl: './star-wars-people.component.html',
  styleUrls: ['./star-wars-people.component.scss']
})
export class StarWarsPeopleComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource();
  private unsubscribe: Subject<void> = new Subject();
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<[]>('https://swapi.dev/api/people/').pipe(
      map(response => {
        console.log(response);
        this.dataSource.data = response;
        console.log(this.dataSource.data);
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
