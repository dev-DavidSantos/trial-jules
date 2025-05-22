import { Component, OnInit, ViewChild, signal, computed, effect, WritableSignal } from '@angular/core'; // Import signal, computed, effect
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule, InputSwitchChangeEvent } from 'primeng/inputswitch'; // Import InputSwitchOnChangeEvent
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

export interface Filter {
  id: number;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    InputSwitchModule,
    CheckboxModule,
    ButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('filterTable') filterTable!: Table;

  // --- Signals for State Management ---
  allFilters: WritableSignal<Filter[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');
  showOnlySelected: WritableSignal<boolean> = signal(false);

  // Signal for the header "Select All" checkbox state
  // This will be two-way bound and also updated by an effect
  selectAllHeaderState: WritableSignal<boolean> = signal(false);

  // --- Computed Signal for Displayed Filters ---
  displayedFilters = computed(() => {
    let result = [...this.allFilters()]; // Start with a copy of all filters

    // 1. Filter by 'showOnlySelected'
    if (this.showOnlySelected()) {
      result = result.filter(f => f.isActive);
    }

    // 2. Filter by 'searchTerm'
    const term = this.searchTerm()?.toLowerCase().trim();
    if (term && term !== '') {
      result = result.filter(f => f.name.toLowerCase().includes(term));
    }
    return result;
  });

  // For VirtualScroll: Estimate the height of a single row in pixels
  virtualScrollItemSize: number = 46;

  constructor() {
    // Effect to synchronize the header selectAll checkbox state with the displayed filters
    effect(() => {
      const currentDisplayed = this.displayedFilters();
      if (currentDisplayed.length === 0) {
        // If no items displayed, header checkbox should be unchecked
        if (this.selectAllHeaderState() !== false) {
          this.selectAllHeaderState.set(false);
        }
        return;
      }
      // Check if all currently displayed items are active
      const allCurrentlySelected = currentDisplayed.every(f => f.isActive);
      if (this.selectAllHeaderState() !== allCurrentlySelected) {
        this.selectAllHeaderState.set(allCurrentlySelected);
      }
    }, { allowSignalWrites: true }); // Necessary because this effect writes to a signal
  }

  ngOnInit() {
    this.generateMockFilters();
  }

  generateMockFilters() {
    const mockData: Filter[] = [];
    for (let i = 1; i <= 200; i++) {
      mockData.push({
        id: i,
        name: `Filter Option ${i}`,
        isActive: i % 7 === 0 // Make some initially active
      });
    }
    this.allFilters.set(mockData); // Set the signal's value
  }

  // Handler for individual row checkbox change
  onRowCheckboxChange(changedFilter: Filter, isActive: boolean): void {
    this.allFilters.update(filters =>
      filters.map(f =>
        f.id === changedFilter.id ? { ...f, isActive: isActive } : f
      )
    );
    // The effect will automatically update selectAllHeaderState if needed
    // If showOnlySelected() is true, and an item is unchecked,
    // displayedFilters() will recompute and remove it.
  }

  // Handler for the header "Select All" checkbox change (triggered by user click)
  onSelectAllChange(isChecked: boolean): void {
    // 'isChecked' is the new state of selectAllHeaderState signal from [(ngModel)]
    const currentDisplayedIds = new Set(this.displayedFilters().map(f => f.id));

    this.allFilters.update(filters =>
      filters.map(f =>
        currentDisplayedIds.has(f.id) ? { ...f, isActive: isChecked } : f
      )
    );
    // The effect will ensure selectAllHeaderState remains consistent,
    // though after this operation, it should already match 'isChecked'.
  }

  // Handler for pInputSwitch change
  onShowOnlySelectedSwitchChange(event: InputSwitchChangeEvent): void {
    this.showOnlySelected.set(event.checked);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }
}