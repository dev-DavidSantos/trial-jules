import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalListComponent } from './animal-list/animal-list.component'; // Import the component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AnimalListComponent // Add to imports
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'animal-search-app';
}