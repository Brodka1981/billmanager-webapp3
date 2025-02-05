import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
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
    if (this.loginForm.valid) {
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      // Invia la richiesta di login al backend
      this.adminService.login(loginData).subscribe({
        next: response => {
          this.authService.login(response.token); // Memorizza il token
          this.router.navigate(['/admin']); // Reindirizza all'area admin
        },
        error: () => {
          this.errorMessage = 'Login fallito: email o password errati.'; // Gestione dell'errore
        }
      });
    }
  }
}
