import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' // Rende il servizio disponibile in tutta l'app
})
export class ErrorHandlerService {
  constructor(private authService: AuthService, private router: Router) {}

  handleHttpError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.authService.logout(); // Rimuove il token scaduto
      this.router.navigate(['/login'], { queryParams: { error: 'Autorizzazione scaduta, accedi nuovamente.' } });
    } else {
      console.error('Errore durante l’accesso ai dati amministrativi.', error);
    }
  }
}
