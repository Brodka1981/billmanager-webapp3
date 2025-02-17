import { Component, OnInit } from '@angular/core';
import { Bill, BillService, Property } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchComponent } from "../search/search.component";
import { Observable } from 'rxjs';
import { LucideAngularModule, Lightbulb, Flame, Droplet } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, SearchComponent, LucideAngularModule,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  readonly Light = Lightbulb;
  readonly Flame = Flame;
  readonly Drop = Droplet;

  property: Property | undefined;
  bills: Bill[] = [];
  totalAmount: number = 0; // Totale importo
  showModal: boolean = false; // Stato della modale
  selectedBill: Bill | null = null; // Bolletta selezionata per eliminazione
  propertyId!: number;
  isSearchVisible: boolean = true;
  titleSuffix: string = '';

  constructor(private billService: BillService, private adminService: AdminService, private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

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
            this.getBillsByProperty(this.propertyId); // Carichiamo tutte le bollette
          }
        });
      }
    });
  }

  getPropertyById(key: string, propertyId: number): void {
    this.adminService.getPropertyById(key, propertyId).subscribe({
      next: (data) => (this.property = data),
      error: (error) => this.handleHttpError(error)
    });
  }

  // Metodo generico per ottenere le bollette
  private fetchBills(propertyId: number, fetchFunction: (propertyId: number, ...args: any[]) => Observable<Bill[]>): void {
    fetchFunction(propertyId).subscribe((bills) => {
      // Ordina le bollette in base alla data di scadenza (dueDate)
      this.bills = bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      this.updateTotalAmount(); // Aggiorna il totale
    });
  }

  // Metodo per ottenere le bollette relative a una proprietà specifica
  getBillsByProperty(propertyId: number): void {
    this.fetchBills(propertyId, this.billService.getBillsByProperty.bind(this.billService));
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

  private handleHttpError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.authService.logout(); // Rimuovi il token scaduto
      this.router.navigate(['/login'], { queryParams: { error: 'Autorizzazione scaduta, accedi nuovamente.' } });
    } else {
      console.error('Errore durante l’accesso ai dati amministrativi.', error);
    }
  }
}
