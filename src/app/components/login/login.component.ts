import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
    private pushService: PushNotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email obbligatoria e valida
      password: ['', Validators.required] // Password obbligatoria
    });
  }

  ngOnInit(): void {
    // Controlla se ci sono parametri di query e impostali come messaggio di errore
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error']; // Imposta il messaggio di errore passato nella query
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    if (this.loginForm.valid) {
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Invia la richiesta di login al backend
      this.adminService.login(loginData).subscribe({
        next: async response => {
          this.authService.login(response.token); // Memorizza il token

          try {
            await this.pushService.registerDeviceToken(response.token);
          } catch (err) {
            console.warn("Registrazione notifiche fallita", err);
          } finally {
            this.isLoading = false;
          }

          this.router.navigate(['/admin']); // Reindirizza all'area admin
        },
        error: () => {
          this.errorMessage = 'Login fallito: email o password errati.'; // Gestione dell'errore
          this.isLoading = false;
        }
      });
    }
  }
}
