import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bill {
  id?: number;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  propertyId: number
}

@Injectable({
  providedIn: 'root'
})

export class BillService {
  private apiUrl = 'http://34.76.130.38/api/bills'; // Per BE in locale http://localhost:5000/api/bills
  private apiPropertiesUrl = 'http://34.76.130.38/api/Properties'; // Per BE in locale  http://localhost:5000/api/Properties


  constructor(private http: HttpClient) {}

  // Ottieni tutte le bollette
  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.apiUrl);
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
