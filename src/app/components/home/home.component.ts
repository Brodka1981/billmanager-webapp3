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

  constructor(private billService: BillService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Otteniamo il parametro propertyId dall'URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('propertyId');
      if (id) {
        this.propertyId = +id; // Convertiamo il valore in un numero
        this.getPropertyById(this.propertyId);
        this.getBillsByProperty(this.propertyId);
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
