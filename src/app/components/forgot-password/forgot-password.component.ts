import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  infoMessage: string | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value;

    this.adminService.requestPasswordReset(email).subscribe({
      next: () => {
        this.infoMessage = 'Se la mail esiste, ti abbiamo inviato un link';
      },
      error: () => {
        this.infoMessage = 'Se la mail esiste, ti abbiamo inviato un link';
      }
    });
  }
}
