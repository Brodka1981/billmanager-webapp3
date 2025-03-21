import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  returnUrl: string = '/admin'; // Default in caso di accesso diretto
  settingsForm: FormGroup;
  showSuccessToast = false; // Variabile per gestire la toast
  showErrorToast = false;
  isSaving = false; // Flag per mostrare lo spinner e disabilitare i pulsanti

  constructor(private fb: FormBuilder, private adminService: AdminService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.settingsForm = this.fb.group({
      receiveNotificationsExpiredBills: [false] // Default: false (disattivato)
    });
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  ngOnInit() {
    this.loadUserSettings();
  }

  // Recupera le impostazioni dal backend
  loadUserSettings() {
    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
    }
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
          //this.router.navigateByUrl(this.returnUrl); // Naviga ad un'altra pagina (opzionale)
        }, 2000);
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
    console.log('Impostazioni salvate:', this.settingsForm.value.receiveNotificationsExpiredBills);
  }

  onCancel() {
    this.router.navigateByUrl(this.returnUrl);
  }
}
