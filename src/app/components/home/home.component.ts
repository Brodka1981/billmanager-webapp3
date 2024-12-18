import { Component, OnInit } from '@angular/core';
import { Bill, BillService, Property } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchComponent } from "../search/search.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, SearchComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  property: Property | undefined;
  bills: Bill[] = [];
  totalAmount: number = 0; // Totale importo
  showModal: boolean = false; // Stato della modale
  selectedBill: Bill | null = null; // Bolletta selezionata per eliminazione
  propertyId!: number;
  isSearchVisible: boolean = true;
  titleSuffix: string = '';

  constructor(private billService: BillService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Otteniamo il parametro propertyId dall'URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('propertyId');
      if (id) {
        this.propertyId = +id; // Convertiamo il valore in un numero
        this.getPropertyById(this.propertyId);
        // Controlliamo i segmenti di URL
        this.route.url.subscribe((urlSegments) => {
          const isUpcoming = urlSegments.some(segment => segment.path === 'upcoming');
          const isExpired = urlSegments.some(segment => segment.path === 'expired');
          // Mostriamo la ricerca solo nella vista "Tutte le bollette"
          this.isSearchVisible = !(isUpcoming || isExpired);

          if (isUpcoming) {
            this.titleSuffix = 'Imminenti';
            this.getUpcomingBills(this.propertyId); // Carichiamo le bollette imminenti
          } else if (isExpired) {
            this.titleSuffix = 'Scadute';
            this.getExpiredBills(this.propertyId); // Carichiamo le bollette scadute
          } else {
            this.titleSuffix = ''; // Nessun suffisso per tutte le bollette
            this.getBillsByProperty(this.propertyId); // Carichiamo tutte le bollette
          }
        });
      }
    });
  }

  getPropertyById(propertyId: number): void {
    this.billService.getPropertyById(propertyId).subscribe((prop) => {
      this.property = prop;
    });
  }

  // Metodo per ottenere le bollette relative a una proprietà specifica
  getBillsByProperty(propertyId: number): void {
    this.billService.getBillsByProperty(propertyId).subscribe((bills) => {
      this.bills = bills;
      this.updateTotalAmount(); // Aggiorna il totale
    });
  }

  getUpcomingBills(propertyId: number): void {
    this.billService.getUpcomingBills(propertyId, this.getDatePlus7Days()).subscribe((bills) => {
      this.bills = bills;
      this.updateTotalAmount();
    });
  }

  getExpiredBills(propertyId: number): void {
    this.billService.getExpiredBills(propertyId).subscribe((bills) => {
      this.bills = bills;
      this.updateTotalAmount();
    });
  }

  getDatePlus7Days(): string {
    const currentDate = new Date();

    // Aggiungi 7 giorni
    currentDate.setDate(currentDate.getDate() + 7);

    // Estrai anno, mese e giorno
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mesi da 0 a 11
    const day = currentDate.getDate().toString().padStart(2, '0');

    // Ritorna la data formattata
    return `${year}-${month}-${day}`;
  }

  handleSearch(filters: any): void {
    this.billService
      .getBillsByFilters(this.propertyId, filters)
      .subscribe((bills) => {
        this.bills = bills;
        this.updateTotalAmount(); // Aggiorna il totale
      });
  }

  // Calcola il totale dell'importo
  updateTotalAmount(): void {
    this.totalAmount = this.bills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  // Cambia lo stato della bolletta
  toggleStatus(bill: Bill): void {
    const newStatus = bill.status === 'Unpaid' ? 'Paid' : 'Unpaid';
    this.billService.updateBill(bill.id!, { status: newStatus }).subscribe(() => {
      // Aggiorna lo stato localmente dopo il successo della richiesta
      bill.status = newStatus;
    });
  }

  // Naviga alla pagina di modifica
  editBill(id: number): void {
    this.router.navigate([`/properties/${this.propertyId}/edit-bill`, id]);
  }

  // Apre la modale e salva la bolletta selezionata
  openModal(bill: Bill): void {
    this.selectedBill = bill;
    this.showModal = true;
  }

  // Chiude la modale senza eliminare nulla
  closeModal(): void {
    this.showModal = false;
    this.selectedBill = null;
  }

  // Elimina la bolletta selezionata
  deleteBill(): void {
    if (this.selectedBill) {
      this.billService.deleteBill(this.selectedBill.id!).subscribe(() => {
        // Rimuovi la bolletta eliminata dall'elenco
        this.bills = this.bills.filter(b => b.id !== this.selectedBill?.id);
        this.updateTotalAmount(); // Ricalcola il totale
        this.closeModal(); // Chiudi la modale
      });
    }
  }
}
