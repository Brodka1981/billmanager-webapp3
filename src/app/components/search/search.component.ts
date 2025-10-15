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

  // Tipi e stati possibili
  billTypeLabels: Record<string, string> = BILL_TYPE_LABELS;
  billTypes = BILL_TYPES;
  billStatuses = ['Paid', 'Unpaid'];
  // Anno corrente
  currentYear = new Date().getFullYear();
  billYears = Array.from({ length: 4 }, (_, i) => String(this.currentYear - i));
   // Filtri di ricerca
  filters = {
    type: '',
    status: '',
    year: String(this.currentYear),
    startDate: new Date(this.currentYear, 0, 1 + 1).toISOString().split('T')[0],
    endDate: new Date(this.currentYear, 11, 31 + 1).toISOString().split('T')[0]
  };

  statusMapping: { [key: string]: string } = {
    Paid: 'Pagato',
    Unpaid: 'Non pagato'
  };

  // Emette l'evento di ricerca
  onSearch() {
    this.search.emit(this.filters);
  }

  onYearChange() {
    if (this.filters.year !== '') {
      const selectedYear = Number(this.filters.year);

      // Primo giorno dell'anno
      const startDate = new Date(selectedYear, 0, 1 + 1);
      // Ultimo giorno dell'anno
      const endDate = new Date(selectedYear, 11, 31 + 1);

      // Imposto le date in formato YYYY-MM-DD
      this.filters.startDate = startDate.toISOString().split('T')[0];
      this.filters.endDate = endDate.toISOString().split('T')[0];
    } else {
      // Se si torna a "Tutti", svuoto le date
      this.filters.startDate = '';
      this.filters.endDate = '';
    }
  }

  onReset() {
    // Primo giorno dell'anno (1 gennaio)
    const startDate = new Date(this.currentYear, 0, 1); // mese 0 = gennaio
    // Ultimo giorno dell'anno (31 dicembre)
    const endDate = new Date(this.currentYear, 11, 31); // mese 11 = dicembre

    // Resetta i filtri allo stato iniziale
    this.filters = {
      type: '',
      status: '',
      year: '',
      startDate: '',
      endDate: ''
      //startDate: startDate.toISOString().split('T')[0], // "YYYY-MM-DD"
      //endDate: endDate.toISOString().split('T')[0],
    };

    this.onSearch();
  }
}
