import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentPropertyId!: number | null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd)) // Trigger only on navigation end
      .subscribe(() => {
        const childRoute = this.getChildRoute(this.route);
        childRoute.params.subscribe((params) => {
          this.currentPropertyId = params['propertyId'] ? +params['propertyId'] : null;
        });
      });
  }

  // Trova la route figlia attiva
  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

}
