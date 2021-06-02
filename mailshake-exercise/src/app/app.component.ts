import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mailshake-exercise';
}

// TODO on further implementation: 
// 1. Create more robust unit tests for star-wars-people and style-paginator
// 2. Modify paginator directive to replace / modify paginator range label 
// 3. Style page number input to match more mat-form-field more closely 