import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  @Output() search = new EventEmitter<any>(); // Emittente per notificare la ricerca al parent

  // Filtri di ricerca
  filters = {
    type: '',
    status: 'Unpaid',
    startDate: '',
    endDate: '',
  };

  // Tipi e stati possibili
  billTypes = ['Luce', 'Gas', 'Acqua'];
  billStatuses = ['Paid', 'Unpaid'];

  statusMapping: { [key: string]: string } = {
    Paid: 'Pagato',
    Unpaid: 'Non pagato'
  };

  ngOnInit(): void {
    this.search.emit(this.filters); // emette subito i filtri di default
  }

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
