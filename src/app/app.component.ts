import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SettingsComponent } from "./components/settings/settings.component";
import { BillModalService } from './services/bill-modal.service';
import { FormsModule } from '@angular/forms';
import { Bill } from './services/bill.service';
import { BILL_TYPE_LABELS, BILL_TYPES } from './shared/bill-type-labels';
import { AdminService } from './services/admin.service';
import { ErrorHandlerService } from './shared/error-handler.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SettingsComponent, FormsModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentUrl: string = '';
  currentPropertyId!: number | null;
  isAdminRoute = false; // Variabile per tracciare se siamo in un percorso admin
  isLoginRoute = false; // Variabile per tracciare se siamo nella login
  user:any;
  showAddBillModal = false;
  newBill: Bill | null = null;
  billTypeLabels: Record<string, string> = BILL_TYPE_LABELS;
  billTypes: string[] = BILL_TYPES;



  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService,
    private billModalService: BillModalService,
    private adminService: AdminService,
    private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd)) // Trigger only on navigation end
      .subscribe(() => {
        const childRoute = this.getChildRoute(this.route);
        childRoute.params.subscribe((params) => {
          this.currentPropertyId = params['propertyId'] ? +params['propertyId'] : null;
        });
        // Controlla se il percorso corrente contiene "admin"
        this.isAdminRoute = this.router.url.includes('admin') || this.router.url.includes('login') || this.router.url.includes('register') || this.router.url.includes('settings');
        this.isLoginRoute = this.router.url.includes('login') || this.router.url.includes('register');
        this.currentUrl = this.router.url; // Memorizza l'URL attuale
      });
  }

  // Trova la route figlia attiva
  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  logout(): void {
    this.authService.logout(); // Rimuove il token o i dati utente
    this.router.navigate(['/login']); // Reindirizza alla pagina di login
  }

  openAddBillModal(event?: Event): void {
    if (!this.currentPropertyId) {
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();

    this.newBill = {
      type: '',
      amount: 0,
      dueDate: '',
      status: 'unpaid',
      propertyId: this.currentPropertyId
    };
    this.showAddBillModal = true;
  }

  closeAddBillModal(): void {
    this.showAddBillModal = false;
    this.newBill = null;
  }

  saveNewBill(): void {
    if (!this.newBill || !this.newBill.type || !this.newBill.dueDate || !this.currentPropertyId) {
      return;
    }

    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
      return;
    }

    const formattedBill: Bill = {
      ...this.newBill,
      propertyId: this.currentPropertyId,
      amount: Number(this.newBill.amount),
      dueDate: new Date(this.newBill.dueDate).toISOString().split('T')[0]
    };

    this.adminService.addBill(key, formattedBill).subscribe({
      next: (createdBill) => {
        const normalizedBill: Bill = {
          ...createdBill,
          propertyId: this.currentPropertyId!,
          status: createdBill.status
            ? (createdBill.status.toLowerCase() === 'unpaid' ? 'Unpaid' : createdBill.status)
            : 'Unpaid',
          dueDate: createdBill.dueDate
            ? (createdBill.dueDate.includes('T') ? createdBill.dueDate : new Date(createdBill.dueDate).toISOString())
            : formattedBill.dueDate
        };

        this.billModalService.notifyBillCreated(normalizedBill);
        this.closeAddBillModal();
      },
      error: (error) => this.errorHandler.handleHttpError(error)
    });
  }
}
