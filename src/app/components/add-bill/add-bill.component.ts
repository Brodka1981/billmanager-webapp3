import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Bill, BillService } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-bill',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-bill.component.html',
  styleUrl: './add-bill.component.css'
})
export class AddBillComponent implements OnInit {
  // Lista delle opzioni per il tipo di bolletta
  billTypes: string[] = ['Luce', 'Gas', 'Acqua'];

  bill: Bill = {
    type: '',
    amount: 0,
    dueDate: '',
    status: 'unpaid',
    propertyId: 1
  };

  // Flag per distinguere creazione da modifica
  isEditMode: boolean = false;

  propertyId!: number;
  // Costruttore AddBillComponent sdsddssfsdfsfsd
  constructor(private billService: BillService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Recupera il propertyId dalla route
    this.route.paramMap.subscribe((params) => {
      const propertyIdParam = params.get('propertyId');
      if (propertyIdParam) {
        this.propertyId = +propertyIdParam; // Converte in numero
        this.bill.propertyId = this.propertyId;
      }
    });

    // Recupera l'id dalla route, se presente
    const billId = this.route.snapshot.paramMap.get('id');
    if (billId) {
      this.isEditMode = true;
      this.getBillDetails(Number(billId));
    }
  }

  // Recupera i dettagli della bolletta per popolare il modulo
  getBillDetails(id: number): void {
    this.billService.getBillById(id).subscribe((bill) => {
      // Converte la data da "YYYY-MM-DDTHH:mm:ss" a "YYYY-MM-DD"
      if (bill.dueDate) {
        bill.dueDate = bill.dueDate.split('T')[0];
      }
      this.bill = bill;
    });
  }

  saveBill(): void {
    // Formattiamo la data in formato "YYYY-MM-DD" prima di inviarla
    const formattedDate = new Date(this.bill.dueDate).toISOString().split('T')[0];
    const formattedBill = { ...this.bill, dueDate: formattedDate };

    if (this.isEditMode) {
      // Modifica esistente
      this.billService.updateBill(this.bill.id!, formattedBill).subscribe(() => {
        this.router.navigate(['/properties', this.propertyId]); // Torna alla lista delle bollette
      });
    } else {
      // Creazione nuova bolletta
      this.billService.addBill(formattedBill).subscribe(() => {
        this.router.navigate(['/properties', this.propertyId]); // Torna alla lista delle bollette
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/properties', this.propertyId]); // Torna alla lista delle bollette
  }


}
