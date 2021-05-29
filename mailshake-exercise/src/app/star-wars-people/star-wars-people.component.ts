import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, takeUntil, pluck } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

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

export interface film {
  id: number;
  title: string;
}

export interface planet {
  id: string;
  planet: string;
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
  public allFilms: film[] = [];
  public allPlanets: planet[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getFilmsAndHomeWorld();
    //this.getHomeWorld('https://swapi.dev/api/planets/');
    this.getData('https://swapi.dev/api/people/');
  }

  // ngAfterViewInit() {
  //   this.dataSource.sort = this.sort;
  // }

  getData(url?: string) {
    this.http.get<serverResponse>(url).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          const stringFilms = this.resetFilms(res['films']);
          // const stringPlanets = this.resetPlanets(res['homeworld']);
          this.test.push({name: res['name'], world: res['homeworld'], dob: res['birth_year'], films: res['films']});
        });
        // if(firstResponse.next != null) {
        //   this.getData(firstResponse.next);
        // }
        // else {
        //   this.dataSource.data = this.test;
        // }
        this.dataSource.data = this.test;
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
    //this.dataSource.data = this.test;
  }

  getFilmsAndHomeWorld() {
    for (let index = 1; index < 7; index++) {
      this.http.get('https://swapi.dev/api/films/' + index).pipe(
        map(response => {
          this.allFilms.push({id: index, title: response['title']});
        }),
        takeUntil(this.unsubscribe)
      ).subscribe();
    }
    console.log(this.allFilms);
    return this.allFilms;

    // films.forEach(film => {
    //   this.http.get(film).pipe(
    //     map(response => {
    //       tempFilms.push(response['title']);
    //     }),
    //     takeUntil(this.unsubscribe)
    //   ).subscribe();
    // })
  }

  // getHomeWorld(url?: string){
  //   this.http.get<serverResponse>(url).pipe(
  //     map(firstResponse => {
  //       firstResponse.results.forEach(res => {
  //         this.allPlanets.push({id: res['url'], planet: res['homeworld']});
  //       });
  //       if(firstResponse.next != null) {
  //         this.getHomeWorld(firstResponse.next);
  //       }
  //       else {
  //         return this.allPlanets;
  //       }
  //     }),
  //     takeUntil(this.unsubscribe)
  //   ).subscribe();
  // }

  resetFilms(films?: string[]) {
    const tempFilms = [];
    // films.forEach(film => {
    //   console.log('into response loop');
    //   console.log(this.allFilms);
    //   this.allFilms.forEach(title => {
    //     console.log('into all films loop');
    //     if(film.includes((title.id).toString())){
    //       console.log('match found');
    //       tempFilms.push(title.title);
    //     }
    //   })
    // });
    films.forEach(film => {
      console.log(film);
      this.allFilms.forEach(stringVersion => {
        tempFilms.push(stringVersion.title);
        // if(film.toString().includes((stringVersion.id).toString())){
        //   tempFilms.push(stringVersion.title);
        // }
      })
    })
    console.log(tempFilms);
    return tempFilms;
  }

  // resetPlanets(world?: string): string {
  //   let worldName = '';
  //   this.allPlanets.forEach(planet => {
  //     if(world === planet.id){
  //       worldName = planet.planet;
  //     }
  //   });
  //   return worldName;
  // }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
