import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Bill } from './bill.service';

@Injectable({
  providedIn: 'root'
})
export class BillModalService {
  private billCreatedSubject = new Subject<Bill>();

  billCreated$ = this.billCreatedSubject.asObservable();

  notifyBillCreated(bill: Bill): void {
    this.billCreatedSubject.next(bill);
  }
}
