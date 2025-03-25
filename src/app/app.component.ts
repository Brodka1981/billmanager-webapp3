import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SettingsComponent } from "./components/settings/settings.component";
import { AdminService } from './services/admin.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SettingsComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentUrl: string = '';
  currentPropertyId!: number | null;
  isAdminRoute = false; // Variabile per tracciare se siamo in un percorso admin
  isLoginRoute = false; // Variabile per tracciare se siamo nella login
  user:any;



  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd)) // Trigger only on navigation end
      .subscribe(() => {
        const childRoute = this.getChildRoute(this.route);
        childRoute.params.subscribe((params) => {
          this.currentPropertyId = params['propertyId'] ? +params['propertyId'] : null;
        });
        // Controlla se il percorso corrente contiene "admin"
        this.isAdminRoute = this.router.url.includes('admin') || this.router.url.includes('login') || this.router.url.includes('register') || this.router.url.includes('settings');
        this.isLoginRoute = this.router.url.includes('login') || this.router.url.includes('register');
        this.currentUrl = this.router.url; // Memorizza l'URL attuale
      });

      const key = this.authService.getToken();
      if (!key) {
        this.router.navigate(['/login'], { queryParams: { error: 'Token mancante, accedi nuovamente.' } });
      }
      this.adminService.getAuthenticatedUser(key!).subscribe(
        user => {
          this.user = user;
        },
        error => {
          console.error('Errore nel recupero delle impostazioni:', error);
        }
      );
  }

  // Trova la route figlia attiva
  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  logout(): void {
    this.authService.logout(); // Rimuove il token o i dati utente
    this.router.navigate(['/login']); // Reindirizza alla pagina di login
  }
}
