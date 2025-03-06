import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { Bill, Property } from './bill.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiAdmin = environment.apiAdmin;

  constructor(private http: HttpClient) { }

  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiAdmin}/registerUser`, user);
  }

  login(loginData: { email: string; password: string }) {
    return this.http.post<{ token: string }>(this.apiAdmin + '/login', loginData);
  }

  getAdminData(token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiAdmin + '/getData', { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  getProperties(token: string): Observable<Property[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Property[]>(this.apiAdmin + '/getProperties', { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  getPropertiesByUserId(token: string, idUser: number): Observable<Property[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Property[]>(`${this.apiAdmin}/getPropertiesByUserId/${idUser}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  getPropertyById(token: string, id:number): Observable<Property> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Property>(`${this.apiAdmin}/getPropertyById/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  getBillById(token: string, id:number): Observable<Bill> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Bill>(`${this.apiAdmin}/getBillById/${id}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  updateProperty(token: string, id: number, propertyData: Property): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<void>(`${this.apiAdmin}/putProperty/${id}`, propertyData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  addProperty(token: string, propertyData: Property): Observable<Property> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Property>(`${this.apiAdmin}/postProperty`, propertyData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }

  deleteProperty(token: string, id: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiAdmin}/deleteProperty/${id}`, { headers });
  }

  // Aggiungi una nuova bolletta
  addBill(token: string, bill: Bill): Observable<Bill> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Bill>(`${this.apiAdmin}/addBill`, bill, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error); // Passa l'errore al chiamante
      })
    );
  }
}
