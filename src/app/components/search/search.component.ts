import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BILL_TYPE_LABELS, BILL_TYPES } from '../../shared/bill-type-labels';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @Output() search = new EventEmitter<any>(); // Emittente per notificare la ricerca al parent

  // Filtri di ricerca
  filters = {
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  };

  // Tipi e stati possibili
  billTypeLabels: Record<string, string> = BILL_TYPE_LABELS;
  billTypes = BILL_TYPES;
  billStatuses = ['Paid', 'Unpaid'];

  statusMapping: { [key: string]: string } = {
    Paid: 'Pagato',
    Unpaid: 'Non pagato'
  };

  // Emette l'evento di ricerca
  onSearch() {
    this.search.emit(this.filters);
  }

  onReset() {
    // Resetta i filtri allo stato iniziale
    this.filters = {
      type: '',
      status: '',
      startDate: '',
      endDate: '',
    };

    this.onSearch();
  }
}
