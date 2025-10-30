import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { AuthService, JwtClaim } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Property } from '../../services/bill.service';
import { ErrorHandlerService } from '../../shared/error-handler.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {
  userName: string | null = null;
  userId: number | null = null;
  properties: Property[] = [];
  showDeleteModal: boolean = false; // Stato della modale di eliminazione
  showPropertyModal: boolean = false; // Stato della modale per aggiungere/modificare
  errorMessage: string | null = null;
  selectedProperty: Property | null = null; // Proprietà selezionata per eliminazione
  propertyForm: Property = {
    name: '',
    address: ''
  };
  isEditMode: boolean = false;
  propertyModalError: string | null = null;

  constructor(private adminService: AdminService, private authService: AuthService, private router: Router,private errorHandler: ErrorHandlerService) {}

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
      error: (error) => this.errorHandler.handleHttpError(error)
    });
  }

  // Apre la modale per confermare l'eliminazione
  openModal(property: Property): void {
    this.selectedProperty = property;
    this.errorMessage = null; // Resetta eventuali messaggi di errore
    this.showDeleteModal = true;
  }

  // Chiude la modale
  closeModal(): void {
    this.showDeleteModal = false;
    this.selectedProperty = null;
    this.errorMessage = null; // Resetta il messaggio di errore
  }

  // Apre la modale per la creazione di una nuova proprietà
  addProperty(): void {
    this.isEditMode = false;
    this.propertyForm = {
      name: '',
      address: '',
      userid: this.userId ?? undefined
    };
    this.propertyModalError = null;
    this.showPropertyModal = true;
  }

  // Apre la modale per la modifica della proprietà selezionata
  editProperty(property: Property): void {
    this.isEditMode = true;
    this.propertyForm = { ...property };
    if (!this.propertyForm.userid && this.userId) {
      this.propertyForm.userid = this.userId;
    }
    this.propertyModalError = null;
    this.showPropertyModal = true;
  }

  closePropertyModal(): void {
    this.showPropertyModal = false;
    this.propertyModalError = null;
    this.propertyForm = {
      name: '',
      address: ''
    };
  }

  saveProperty(): void {
    if (!this.propertyForm.name || !this.propertyForm.address) {
      this.propertyModalError = 'Compila tutti i campi obbligatori.';
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
      return;
    }

    this.propertyForm.userid = this.userId ?? this.propertyForm.userid;

    if (this.isEditMode && this.propertyForm.id) {
      this.adminService.updateProperty(token, this.propertyForm.id, this.propertyForm).subscribe({
        next: () => {
          this.properties = this.properties.map((property) =>
            property.id === this.propertyForm.id ? { ...property, ...this.propertyForm } : property
          );
          this.closePropertyModal();
        },
        error: (error) => this.errorHandler.handleHttpError(error)
      });
    } else {
      this.adminService.addProperty(token, this.propertyForm).subscribe({
        next: (createdProperty) => {
          const newProperty = {
            ...createdProperty,
            userid: createdProperty.userid ?? this.userId ?? undefined
          };
          this.properties = [...this.properties, newProperty];
          this.closePropertyModal();
        },
        error: (error) => this.errorHandler.handleHttpError(error)
      });
    }
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
            this.errorHandler.handleHttpError(error);
          }
        },
      });
    }
  }
}
