import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { AuthService, JwtClaim } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Property } from '../../services/bill.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {
  userName: string | null = null;
  userId: number | null = null;
  properties: Property[] = [];
  showModal: boolean = false; // Stato della modale
  errorMessage: string | null = null;
  selectedProperty: Property | null = null; // Proprietà selezionata per eliminazione
  constructor(private adminService: AdminService, private authService: AuthService, private router: Router,) {}

  ngOnInit(): void {
    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
    }
    this.userName = this.authService.getClaim(JwtClaim.Name);
    this.userId = +this.authService.getClaim(JwtClaim.NameId)!;
    this.getProperties(key!, this.userId!); // Carica le proprietà all'inizio
  }

  getProperties(key: string, idUser: number): void {
    this.adminService.getPropertiesByUserId(key, idUser).subscribe({
      next: (data) => (this.properties = data),
      error: (error) => this.handleHttpError(error)
    });
  }

  // Apre la modale per confermare l'eliminazione
  openModal(property: Property): void {
    this.selectedProperty = property;
    this.errorMessage = null; // Resetta eventuali messaggi di errore
    this.showModal = true;
  }

  // Chiude la modale
  closeModal(): void {
    this.showModal = false;
    this.selectedProperty = null;
    this.errorMessage = null; // Resetta il messaggio di errore
  }

  // Naviga alla pagina di modifica della proprietà
  editProperty(id: number): void {
    this.router.navigate([`admin/edit-property`, id]);
  }

  addProperty(): void {
    this.router.navigate([`admin/add-property`]);
  }

  deleteProperty(): void {
    if (this.selectedProperty) {
      this.adminService.deleteProperty(this.authService.getToken()!, this.selectedProperty.id!).subscribe({
        next: (data) => (
          this.properties = this.properties.filter(b => b.id !== this.selectedProperty?.id),
          this.closeModal()

        ),
        error: (error) => {
          // Gestisci l'errore qui
          if (error.status === 400) {
            // Gestisci l'errore quando ci sono Bills associati
            this.errorMessage = "Impossibile eliminare la proprietà: ci sono bollette associate.";
          } else {
            this.handleHttpError(error);
          }
        },
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
