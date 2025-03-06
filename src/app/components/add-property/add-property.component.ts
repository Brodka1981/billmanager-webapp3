import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Property } from '../../services/bill.service';
import { AdminService } from '../../services/admin.service';
import { AuthService, JwtClaim } from '../../services/auth.service';
import { ErrorHandlerService } from '../../shared/error-handler.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css'
})
export class AddPropertyComponent implements OnInit {
  property: Property = {
    name: '',
    address: ''
  };
  // Flag per distinguere creazione da modifica
  isEditMode: boolean = false;

  constructor(private authService: AuthService, private adminService: AdminService, private router: Router, private route: ActivatedRoute, private errorHandler: ErrorHandlerService) {}
  ngOnInit(): void {
    const key = this.authService.getToken();
    if (!key) {
      this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
    }
    // Recupera l'id dalla route, se presente
    const propId = this.route.snapshot.paramMap.get('id');
    if (propId) {
      this.isEditMode = true;
      this.getPropertyDetails(key!, Number(propId));
    } else{
      this.property.userid = Number(this.authService.getClaim(JwtClaim.NameId));
    }
  }

  getPropertyDetails(token: string, id: number): void {
    this.adminService.getPropertyById(token, id).subscribe({
      next: (data) => (this.property = data),
      error: (error) => this.errorHandler.handleHttpError(error)
    });
  }

  saveProperty(){

    if (this.isEditMode) {
      // Modifica esistente
      this.adminService.updateProperty(this.authService.getToken()!,this.property.id!, this.property).subscribe({
        next: (data) => (this.router.navigate(['/admin'])),
        error: (error) => this.errorHandler.handleHttpError(error)
      });
    } else {
      // Creazione nuova bolletta
      this.adminService.addProperty(this.authService.getToken()!, this.property).subscribe({
        next: (data) => (this.router.navigate(['/admin'])),
        error: (error) => this.errorHandler.handleHttpError(error)
      });
    }
  }

  cancel(){
    this.router.navigate(['/admin']);
  }

}
