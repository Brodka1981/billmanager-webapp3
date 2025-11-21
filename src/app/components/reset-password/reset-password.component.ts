import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  tokenValid = false;
  validationMessage: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private adminService: AdminService) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.errorMessage = 'Token non presente o non valido.';
      return;
    }

    this.adminService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.tokenValid = true;
        this.validationMessage = response.message;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Token non valido.';
      }
    });
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage = 'Token mancante.';
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const newPassword = this.resetForm.get('newPassword')?.value;

    this.adminService.resetPassword({ token: this.token, newPassword }).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Password aggiornata con successo.';
        this.errorMessage = null;
      },
      error: (error) => {
        this.successMessage = null;
        this.errorMessage = error?.error?.message || 'Errore durante il reset della password.';
      }
    });
  }
}
