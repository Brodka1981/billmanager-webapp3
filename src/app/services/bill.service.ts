import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Bill {
  id?: number;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  propertyId: number
}

export interface Property {
  id?: number;
  name: string;
  address: number;
}

@Injectable({
  providedIn: 'root'
})

export class BillService {
  // Utilizza le variabili dell'ambiente
  private apiUrl = environment.apiUrl;
  private apiPropertiesUrl = environment.apiPropertiesUrl;

  constructor(private http: HttpClient) {}

  // Ottieni tutte le bollette
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl);
  }

  getPropertyById(propertyId: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiPropertiesUrl}/${propertyId}`);
  }

  getBillsByProperty(propertyId: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiPropertiesUrl}/${propertyId}/Bills`);
  }

  getBillsByFilters(propertyId: number, filters: any) {
    let params = new HttpParams();

    // Aggiunge i parametri alla richiesta solo se esistono
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<Bill[]>(`${this.apiPropertiesUrl}/${propertyId}/Bills`, { params });
  }

  getUpcomingBills(propertyId: number, endDate: string): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiPropertiesUrl}/${propertyId}/Bills/Upcoming?endDate=${endDate}`);
  }

  getExpiredBills(propertyId: number): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiPropertiesUrl}/${propertyId}/Bills/Overdue`);
  }

  // Aggiungi una nuova bolletta
  addBill(bill: Bill): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, bill);
  }

  // Recupera una bolletta specifica
  getBillById(id: number): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/${id}`);
  }

  // Elimina una bolletta
  deleteBill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Aggiorna la bolletta
  updateBill(id: number, body: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, body);
  }
}
