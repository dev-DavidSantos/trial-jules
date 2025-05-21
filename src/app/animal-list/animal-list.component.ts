import {
  Component, OnInit, signal, computed, WritableSignal, Signal, effect,
  ViewChild, ElementRef, afterNextRender // Added ViewChild, ElementRef, afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollerModule } from 'primeng/scroller';
import { SkeletonModule } from 'primeng/skeleton';

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
    FormsModule,
    InputTextModule,
    CardModule,
    CheckboxModule,
    ScrollerModule,
    SkeletonModule,
  ],
  templateUrl: './animal-list.component.html',
  styleUrls: ['./animal-list.component.scss']
})
export class AnimalListComponent implements OnInit {
  // --- Signals for State Management ---
  searchTerm: WritableSignal<string> = signal('');
  allAnimals: WritableSignal<Animal[]> = signal([]);

  // --- Template Reference for Select All Checkbox ---
  @ViewChild('selectAllCheckboxRef', { read: ElementRef }) selectAllCheckboxRef!: ElementRef;

  // --- Computed Signal for Derived State ---
  filteredAnimals: Signal<Animal[]> = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const animals = this.allAnimals();

    if (!term) {
      return [...animals];
    }
    return animals.filter(animal =>
      animal.name.toLowerCase().includes(term)
    );
  });

  checkedAnimals: Signal<Animal[]> = computed(() => {
    return this.allAnimals().filter(animal => animal.selected);
  }
  );

  // --- Computed Signal for the Master "Select All" Checkbox State ---
  masterCheckboxStatus: Signal<{ checked: boolean; indeterminate: boolean; disabled: boolean }> = computed(() => {
    const animalsInFilter = this.filteredAnimals();
    const totalFiltered = animalsInFilter.length;

    if (totalFiltered === 0) {
      return { checked: false, indeterminate: false, disabled: true };
    }

    const selectedCount = animalsInFilter.filter(a => a.selected).length;

    if (selectedCount === totalFiltered) {
      return { checked: true, indeterminate: false, disabled: false }; // All selected
    }
    if (selectedCount === 0) {
      return { checked: false, indeterminate: false, disabled: false }; // None selected
    }
    return { checked: false, indeterminate: true, disabled: false }; // Some selected (indeterminate)
  });


  private commonAnimalsData: string[] = [
    "Dog", "Cat", "Elephant", "Lion", "Tiger", "Bear", "Giraffe", "Zebra",
    "Monkey", "Kangaroo", "Panda", "Koala", "Horse", "Cow", "Sheep", "Goat",
    "Pig", "Chicken", "Duck", "Rabbit", "Fox", "Wolf", "Deer", "Squirrel",
    "Mouse", "Penguin", "Dolphin", "Whale", "Shark", "Octopus", "Eagle", "Owl"
  ];

  constructor() {
    // Effect to update the native indeterminate property of the selectAll checkbox
    // afterNextRender ensures the ViewChild is available and DOM is ready
    afterNextRender(() => {
      effect(() => {
        if (this.selectAllCheckboxRef?.nativeElement) {
          const nativeCheckbox = this.selectAllCheckboxRef.nativeElement.querySelector('input[type="checkbox"]');
          if (nativeCheckbox) {
            const status = this.masterCheckboxStatus();
            (nativeCheckbox as HTMLInputElement).indeterminate = status.indeterminate;
          }
        }
      });
    });

    // Optional: Effect for logging changes
    effect(() => {
      console.log('Search term:', this.searchTerm(), 'Filtered count:', this.filteredAnimals().length);
      // console.log('Master Checkbox Status:', this.masterCheckboxStatus());
    });
  }

  ngOnInit(): void {
    const initialAnimals = this.commonAnimalsData.map((name, index) => ({
      id: index + 1,
      name: name,
      selected: false
    }));
    this.allAnimals.set(initialAnimals);
  }

  onSearchChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchTerm.set(inputValue);
  }

  // Handles individual animal checkbox changes
  onAnimalSelectionChange(changedAnimal: Animal): void {
    this.allAnimals.update(currentAnimals =>
      currentAnimals.map(animal =>
        animal.id === changedAnimal.id
          ? { ...animal, selected: changedAnimal.selected }
          : animal
      )
    );
    // this.logSelectedAnimals(); // Log if needed
  }

  // Handles the "Select All" checkbox click
  toggleSelectAll(): void {
    const currentFilteredAnimals = this.filteredAnimals();
    if (currentFilteredAnimals.length === 0) return; // Do nothing if no items are filtered

    const currentStatus = this.masterCheckboxStatus();
    // If indeterminate or unchecked, the goal is to select all. Otherwise (if checked), deselect all.
    const newSelectedState = currentStatus.indeterminate || !currentStatus.checked;

    this.allAnimals.update(currentAllAnimals => {
      const filteredAnimalIds = new Set(currentFilteredAnimals.map(a => a.id));
      return currentAllAnimals.map(animal => {
        if (filteredAnimalIds.has(animal.id)) { // Only modify animals in the current filter
          return { ...animal, selected: newSelectedState };
        }
        return animal;
      });
    });
    // this.logSelectedAnimals(); // Log if needed
  }

  logSelectedAnimals(): void {
    const selected = this.allAnimals().filter(animal => animal.selected);
    console.log("Selected Animals:", selected.map(a => a.name));
  }
}