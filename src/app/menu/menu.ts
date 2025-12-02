import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container-fluid">
      
        <a
          class="navbar-brand d-flex align-items-center gap-2"
          [routerLink]="['/users', userId, 'books']"
        >
          <i class="fa-regular fa-house fa-lg"></i>
          
        </a>

       
        <button
          class="navbar-toggler"
          type="button"
          (click)="toggleNavbar()"
          [attr.aria-expanded]="!isCollapsed"
          aria-controls="mainNavbar"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

       
        <div class="collapse navbar-collapse" [class.show]="!isCollapsed" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/users', userId, 'books']"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="closeOnMobile()"
              >
                Books
              </a>
            </li>

            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/users', userId, 'quotes']"
                routerLinkActive="active"
                (click)="closeOnMobile()"
              >
                Quotes
              </a>
            </li>
          </ul>

          <button type="button" class="btn btn-outline-light" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './menu.css',
})
export class MenuComponent {
  @Input({ required: true }) userId!: number | null;

  private auth = inject(AuthService);
  private router = inject(Router);

  isCollapsed = true;

  toggleNavbar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  closeOnMobile(): void {
    this.isCollapsed = true;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
