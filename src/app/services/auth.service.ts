import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwtToken';
  private token: string | null = null;

  constructor() {}

  // Recupera il token dal localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(token: string) {
    this.token = token; // Salva il token quando l'utente effettua il login
    localStorage.setItem(this.tokenKey, token); // Salva il token nel local storage
  }

  logout() {
    this.token = null; // Rimuovi il token
    localStorage.removeItem(this.tokenKey); // Rimuovi il token dal local storage
  }

  isAuthenticated(): boolean {
    // Controlla se il token esiste e non è scaduto
    this.token = this.getToken();
    return this.token !== null; // Puoi anche implementare una logica per controllare la scadenza del token
  }

  // Recupera un claim specifico dal token
  getClaim(claim: JwtClaim): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded[claim] : null;
  }

  // Decodifica il token JWT
  getDecodedToken(): any | null {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode<JwtPayload & { [key: string]: any }>(token);
      } catch (error) {
        console.error('Errore nella decodifica del token JWT:', error);
        return null;
      }
    }
    return null;
  }
}

export enum JwtClaim {
  NameId = 'nameid',
  Name = 'name',
  Email = 'email',
  Role = 'role',
  NotBefore = 'nbf',
  Expiration = 'exp',
  IssuedAt = 'iat'
}
