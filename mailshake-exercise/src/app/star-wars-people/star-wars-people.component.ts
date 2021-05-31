import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { PeopleModel, Film, Planet, ServerResponse } from '../models/star-wars-models';

@Component({
  selector: 'app-star-wars-people',
  templateUrl: './star-wars-people.component.html',
  styleUrls: ['./star-wars-people.component.scss']
})
export class StarWarsPeopleComponent implements OnInit, OnDestroy, AfterViewInit {
  public dataSource = new MatTableDataSource();
  public displayedColumns: string[] = ['name', 'world', 'year', 'films'];

  public rowData: PeopleModel[] = [];
  private allFilms: Film[] = [];
  private allPlanets: Planet[] = [];

  public isLoading = true;
  private unsubscribe: Subject<void> = new Subject();

  filterForm: FormGroup = this.formBuilder.group({
    filterSelection: '',
    filterValue: '',
  });

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // Get films & worlds from API in the correct format to prevent a race condition
    this.getFilms();
    this.getWorlds('https://swapi.dev/api/planets/');
  }

  ngAfterViewInit() {
    // Setup material sorting and pagination
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, header) => data[header];
    this.dataSource.paginator = this.paginator;
  }

  getFilms() {
    // For each film, send a request to the API
    for (let index = 1; index < 7; index++) {
      this.http.get('https://swapi.dev/api/films/' + index).pipe(
        map(response => {
          // Save the page number and the title for joining together with people array
          this.allFilms.push({ id: index, title: response[`title`] });
        },
        error => {
          console.log('Error loading films: ' + error);
        }),
        takeUntil(this.unsubscribe)
      ).subscribe();
    }
    return this.allFilms;
  }

  getWorlds(url?: string) {
    // This is a recursive method that uses responses from the API that use http instead of https
    // Clean that up to prevent duplicate calls
    let httpsUrl = url;
    if (url.includes('http:')) {
      httpsUrl = url.replace('http:', 'https:');
    }
    this.http.get<ServerResponse>(httpsUrl).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          // Grab only what we need - the url for joining with people and the planet name
          this.allPlanets.push({ id: res[`url`], planet: res[`name`] });
        });
        if (firstResponse.next != null) {
          // If there's more pages, run the method again to make sure we get all planets
          this.getWorlds(firstResponse.next);
        }
        else {
          // If there are no more pages, we're ready to grab our people and link it all together
          return this.getData('https://swapi.dev/api/people/');
        }
      },
      error => {
        console.log('Error loading worlds: ' + error);
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }

  getData(url: string) {
    // Ensure we're only sending https requests, not http
    let httpsUrl = url;
    if (url.includes('http:')) {
      httpsUrl = url.replace('http:', 'https:');
    }
    this.http.get<ServerResponse>(httpsUrl).pipe(
      map(firstResponse => {
        firstResponse.results.forEach(res => {
          // Response from API for films/worlds is a URL
          // Convert that to a string by using our existing planets / films arrays
          const stringFilms = this.convertFilms(res[`films`]);
          const stringPlanets = this.convertPlanets(res[`homeworld`]);
          // Push each new person into our rowData people array
          this.rowData.push({ name: res[`name`], world: stringPlanets, dob: res[`birth_year`], films: stringFilms });
        });
        if (firstResponse.next != null) {
          // Call this method again with the next URL if it exists
          this.getData(firstResponse.next);
        }
        else {
          // If we're out of people, we'll set our datasource to our rowData and set the loading spinner to false
          this.dataSource.data = this.rowData;
          this.isLoading = false;
        }
      },
      error => {
        console.log('Error loading people: ' + error);
      }),
      takeUntil(this.unsubscribe)
    ).subscribe();
  }

  convertFilms(films?: string[]) {
    const tempFilms = [];
    films.forEach(film => {
      this.allFilms.forEach(stringVersion => {
        // if the array of film URLs includes the id, push the title only to a new array and return
        if (film.includes((stringVersion.id).toString())) {
          tempFilms.push(stringVersion.title);
        }
      });
    });
    return tempFilms;
  }

  convertPlanets(world?: string): string {
    let worldName = '';
    this.allPlanets.forEach(planet => {
      // if the world URL matches the planet id, return the actual planet name
      if (world === planet.id) {
        worldName = planet.planet;
      }
    });
    return worldName;
  }

  filter(value: string) {
    // Only want to filter if a selection has been made
    if (this.filterForm.get('filterSelection').value === null) {
      return;
    }
    
    const formattedValue = value.toLowerCase().trim();

    // only filter if the input isn't blank
    if (formattedValue !== ' ') {
      switch (this.filterForm.get('filterSelection').value) {
        case 'film':
          this.dataSource.data = this.rowData.filter(row => row.films.find(film => film.toLowerCase().includes(formattedValue)));
          break;
        case 'name':
          this.dataSource.data = this.rowData.filter(row => row.name.toLowerCase().includes(formattedValue));
          break;
        case 'world':
          this.dataSource.data = this.rowData.filter(row => row.world.toLowerCase().includes(formattedValue));
          break;
        default:
          break;
      }
    }
  }


  loadData() {
    this.isLoading = true;
    // if the data has already been loaded, clear it out so we can start again without duplicates
    if (this.rowData.length > 1) {
      this.rowData = [];
    }
    this.getData('https://swapi.dev/api/people/');
  }

  ngOnDestroy(): void {
    // cut off subscriptions on destroy to prevent memory leaks
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
