import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  settingsForm: FormGroup;
  showSuccessToast = false; // Variabile per gestire la toast
  showErrorToast = false;
  isSaving = false; // Flag per mostrare lo spinner e disabilitare i pulsanti

  constructor(private fb: FormBuilder, private adminService: AdminService, private authService: AuthService, private router: Router) {
    this.settingsForm = this.fb.group({
      receiveNotificationsExpiredBills: [false] // Default: false (disattivato)
    });
  }

  ngOnInit() {
    this.loadUserSettings();
  }

  ngAfterViewInit() {
    // Intercetta l'evento di apertura della modale
    const modalElement = document.getElementById('settingsModal');
    if (modalElement) {
      modalElement.addEventListener('shown.bs.modal', () => {
        this.loadUserSettings();
      });
    }
  }

  // Recupera le impostazioni dal backend
  loadUserSettings() {
    const key = this.authService.getToken();
    if (key) {
      this.adminService.getAuthenticatedUser(key!).subscribe(
        user => {
          this.settingsForm.patchValue({
            receiveNotificationsExpiredBills: user.receiveNotificationsExpiredBills
          });
        },
        error => {
          console.error('Errore nel recupero delle impostazioni:', error);
        }
      );
    }
  }

  onSave() {
    this.isSaving = true; // Mostra il caricamento e disabilita i pulsanti
    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
    }

    const newValue = this.settingsForm.value.receiveNotificationsExpiredBills;
    this.adminService.updateNotificationPreference(key!, newValue).subscribe(
      response => {
        this.isSaving = false;
        this.showSuccessToast = true; // Mostra la toast

        setTimeout(() => {
          this.showSuccessToast = false; // Nasconde la toast dopo 3s
          // Chiudi la modale dopo la visualizzazione della toast
          const modalElement = document.getElementById('settingsModal');
          if (modalElement) {
            const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement); // Usa window per bypassare TypeScript
            if (modalInstance) {
              modalInstance.hide(); // Chiude la modale
            }
          }
        }, 1000);
      },
      error => {
        console.error('Errore durante il salvataggio:', error);
        this.isSaving = false;
        this.showErrorToast = true; // Mostra la toast
        setTimeout(() => {
          this.showErrorToast = false; // Nasconde la toast dopo 3s
        }, 2000);
      }
    );
  }
}
