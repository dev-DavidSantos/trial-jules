import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollerModule } from 'primeng/scroller'; // For efficient scrolling
import { SkeletonModule } from 'primeng/skeleton';
// If you prefer VirtualScroller for very large lists:
// import { VirtualScrollerModule } from 'primeng/virtualscroller';

interface Animal {
  id: number;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // For ngModel
    InputTextModule,
    SkeletonModule,
    CardModule,
    CheckboxModule,
    ScrollerModule,
    // VirtualScrollerModule, // if using virtual scroller
  ],
  templateUrl: './animal-list.component.html',
  styleUrls: ['./animal-list.component.scss']
})
export class AnimalListComponent implements OnInit {
  searchTerm: string = '';
  allAnimals: Animal[] = [];
  filteredAnimals: Animal[] = [];

  // Sample common animals
  private commonAnimalsData: string[] = [
    "Dog", "Cat", "Elephant", "Lion", "Tiger", "Bear", "Giraffe", "Zebra",
    "Monkey", "Kangaroo", "Panda", "Koala", "Horse", "Cow", "Sheep", "Goat",
    "Pig", "Chicken", "Duck", "Rabbit", "Fox", "Wolf", "Deer", "Squirrel",
    "Mouse", "Penguin", "Dolphin", "Whale", "Shark", "Octopus", "Eagle", "Owl"
  ];

  ngOnInit(): void {
    this.allAnimals = this.commonAnimalsData.map((name, index) => ({
      id: index + 1,
      name: name,
      selected: false
    }));
    this.filterAnimals(); // Initialize with all animals
  }

  filterAnimals(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredAnimals = [...this.allAnimals];
    } else {
      this.filteredAnimals = this.allAnimals.filter(animal =>
        animal.name.toLowerCase().includes(term)
      );
    }
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterAnimals();
  }

  // Optional: A method to see which animals are selected
  logSelectedAnimals(): void {
    const selected = this.allAnimals.filter(animal => animal.selected);
    console.log("Selected Animals:", selected);
  }
}