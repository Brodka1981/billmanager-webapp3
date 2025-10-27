import { Component, OnInit } from '@angular/core';
import { Bill, BillService, Property } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchComponent } from "../search/search.component";
import { Observable } from 'rxjs';
import { LucideAngularModule, Lightbulb, Flame, Droplet, Tractor, Recycle, House } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { ErrorHandlerService } from '../../shared/error-handler.service';
import { BILL_TYPE_LABELS, BILL_TYPES } from '../../shared/bill-type-labels';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, SearchComponent, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  readonly Light = Lightbulb;
  readonly Flame = Flame;
  readonly Drop = Droplet;
  readonly Recycle = Recycle;
  readonly Tractor = Tractor;
  readonly House = House;

  property: Property | undefined;
  bills: Bill[] = [];
  totalAmount: number = 0; // Totale importo
  showModal: boolean = false; // Stato della modale eliminazione
  selectedBill: Bill | null = null; // Bolletta selezionata per eliminazione
  showEditModal: boolean = false; // Stato della modale di modifica
  editingBill: Bill | null = null; // Bolletta selezionata per modifica
  propertyId!: number;
  isSearchVisible: boolean = true;
  titleSuffix: string = '';
  selectedYear: string = '';

  billTypeLabels: Record<string, string> = BILL_TYPE_LABELS;
  billTypes: string[] = BILL_TYPES;

  constructor(private billService: BillService, private adminService: AdminService, private router: Router, private route: ActivatedRoute, private authService: AuthService,private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
    }
    // Otteniamo il parametro propertyId dall'URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('propertyId');
      if (id) {
        this.propertyId = +id; // Convertiamo il valore in un numero
        this.getPropertyById(key!, this.propertyId);
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
            //this.getBillsByProperty(this.propertyId); // Carichiamo tutte le bollette
            this.getBillsByPropertyAndYear(this.propertyId); // Carichiamo tutte le bollette dell'anno corrente
          }
        });
      }
    });
  }

  getPropertyById(key: string, propertyId: number): void {
    this.adminService.getPropertyById(key, propertyId).subscribe({
      next: (data) => (this.property = data),
      error: (error) => this.errorHandler.handleHttpError(error)
    });
  }

  // Metodo generico per ottenere le bollette
  private fetchBills(propertyId: number, fetchFunction: (propertyId: number, ...args: any[]) => Observable<Bill[]>): void {
    fetchFunction(propertyId).subscribe((bills) => {
      // Ordina le bollette in base alla data di scadenza (dueDate)
      this.bills = bills.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      this.updateTotalAmount(); // Aggiorna il totale
    });
  }

  // Metodo per ottenere tutte le bollette relative a una proprietà specifica
  getBillsByProperty(propertyId: number): void {
    this.fetchBills(propertyId, this.billService.getBillsByProperty.bind(this.billService));
  }

  // Metodo per ottenere tutte le bollette dell'anno corrente
  getBillsByPropertyAndYear(propertyId: number): void {

    // Anno corrente
    const currentYear = new Date().getFullYear();
    this.selectedYear = String(currentYear);
    // Primo giorno dell'anno (1 gennaio)
    const startDate = new Date(currentYear, 0, 1); // mese 0 = gennaio
    // Ultimo giorno dell'anno (31 dicembre)
    const endDate = new Date(currentYear, 11, 31); // mese 11 = dicembre

    // Resetta i filtri allo stato iniziale
    const filters = {
      type: '',
      status: '',
      year: this.selectedYear,
      startDate: startDate.toISOString().split('T')[0], // "YYYY-MM-DD"
      endDate: endDate.toISOString().split('T')[0],
    };

    this.fetchBills(propertyId, (id) => this.billService.getBillsByFilters(id, filters));
  }

  // Metodo per ottenere le bollette in scadenza
  getUpcomingBills(propertyId: number): void {
    this.fetchBills(propertyId, (id) => this.billService.getUpcomingBills(id, this.getDatePlus7Days()));
  }

  // Metodo per ottenere le bollette scadute
  getExpiredBills(propertyId: number): void {
    this.fetchBills(propertyId, this.billService.getExpiredBills.bind(this.billService));
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
    // Salvo l’anno selezionato per mostrarlo nel titolo
    this.selectedYear = filters.year !== '' ? filters.year : '';

    this.billService
      .getBillsByFilters(this.propertyId, filters)
      .subscribe((bills) => {
        this.bills = bills.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
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

  // Apre la modale di modifica popolando i dati della bolletta
  openEditModal(bill: Bill): void {
    const normalizedDueDate = bill.dueDate && bill.dueDate.includes('T')
      ? bill.dueDate.split('T')[0]
      : bill.dueDate;
    this.editingBill = { ...bill, propertyId: this.propertyId, dueDate: normalizedDueDate };
    this.showEditModal = true;
  }

  // Chiude la modale di modifica senza salvare
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingBill = null;
  }

  // Salva le modifiche apportate alla bolletta
  saveEditedBill(): void {
    if (!this.editingBill?.id) {
      return;
    }

    const formattedDueDate = new Date(this.editingBill.dueDate).toISOString().split('T')[0];
    const updatedBill: Bill = { ...this.editingBill, dueDate: formattedDueDate };

    this.billService.updateBill(this.editingBill.id, updatedBill).subscribe(() => {
      const index = this.bills.findIndex((bill) => bill.id === this.editingBill?.id);
      if (index !== -1) {
        this.bills[index] = { ...updatedBill };
        this.updateTotalAmount();
      }
      this.closeEditModal();
    });
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

  isBillExpired(bill: Bill): boolean {
    return new Date(bill.dueDate) < new Date() && bill.status !== 'Paid';
  }
}
