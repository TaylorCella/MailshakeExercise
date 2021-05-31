import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, takeUntil, pluck, withLatestFrom, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder } from '@angular/forms';

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
  public pageNumber: number;
  public totalPageNumber: number;

  filterForm: FormGroup = this.formBuilder.group({
    filterSelection: '',
    filterValue: '',
  });


  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getFilmsAndHomeWorld();
    this.getHomeWorld('https://swapi.dev/api/planets/');

  }

  ngAfterViewInit() {
    this.sort.start = "asc"
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  filter(value: string) {
    if (this.filterForm.get('filterSelection').value === null) {
      return;
    }
    // add switch statement 
    if (value != ' ') {
      if (this.filterForm.get('filterSelection').value === 'film') {
        this.dataSource.data = this.test.filter(row => row.films.find(film => film.toLowerCase().includes(value)));
      } else if (this.filterForm.get('filterSelection').value === 'name') {
        this.dataSource.data = this.test.filter(row => row.name.toLowerCase().includes(value));
      } else if (this.filterForm.get('filterSelection').value === 'world') {
        this.dataSource.data = this.test.filter(row => row.world.toLowerCase().includes(value));
      }
      else {
        return;
      }
    }
  }

  loadData() {
    if (this.test.length > 1) {
      this.test = [];
    }
    this.getData('https://swapi.dev/api/people/');
  }

  getData(url?: string) {
    // todo: replace http with https 
    this.http.get<serverResponse>(url).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          const stringFilms = this.resetFilms(res['films']);
          const stringPlanets = this.resetPlanets(res['homeworld']);
          this.test.push({ name: res['name'], world: stringPlanets, dob: res['birth_year'], films: stringFilms });
        });
        if (firstResponse.next != null) {
          this.getData(firstResponse.next);
        }
        else {
          this.dataSource.data = this.test;
          this.totalPageNumber = Math.ceil(this.test.length / 10);
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
    //this.dataSource.data = this.test;
  }

  getFilmsAndHomeWorld() {
    for (let index = 1; index < 7; index++) {
      this.http.get('https://swapi.dev/api/films/' + index).pipe(
        map(response => {
          this.allFilms.push({ id: index, title: response['title'] });
        }),
        takeUntil(this.unsubscribe)
      ).subscribe();
    }
    console.log(this.allFilms);
    return this.allFilms;
  }

  getHomeWorld(url?: string) {
    this.http.get<serverResponse>(url).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          this.allPlanets.push({ id: res['url'], planet: res['name'] });
        });
        if (firstResponse.next != null) {
          this.getHomeWorld(firstResponse.next);
        }
        else {
          return this.getData('https://swapi.dev/api/people/');
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }

  resetFilms(films?: string[]) {
    const tempFilms = [];
    films.forEach(film => {
      this.allFilms.forEach(stringVersion => {
        if (film.includes((stringVersion.id).toString())) {
          tempFilms.push(stringVersion.title);
        }
      })
    })
    return tempFilms;
  }

  resetPlanets(world?: string): string {
    let worldName = '';
    this.allPlanets.forEach(planet => {
      if (world === planet.id) {
        worldName = planet.planet;
      }
    });
    return worldName;
  }

  goToPage(value: number) {
  this.paginator.pageIndex = value - 1, // number of the page you want to jump.
    this.paginator.page.next({
      pageIndex: value,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
