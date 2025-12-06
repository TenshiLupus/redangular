import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav
  class="navbar navbar-expand-lg mb-4 sticky-top"
  [ngClass]="
    isDarkMode
      ? 'navbar-dark bg-dark'
      : 'navbar-light bg-light border-bottom shadow-sm'
  "
>
  <div class="container-fluid position-relative">


    <a
      class="navbar-brand d-flex align-items-center gap-2"
      [routerLink]="['/users', userId, 'books']"
    >
      <i class="fa-regular fa-house fa-lg"></i>
    </a>


    <button
      type="button"
      class="btn btn-sm d-flex align-items-center gap-2 theme-toggle-btn
             position-absolute top-0 start-50 translate-middle-x mt-2"
      [ngClass]="isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
      (click)="toggleTheme()"
    >
      <i
        class="fa-regular"
        [class.fa-sun]="isDarkMode"
        [class.fa-moon]="!isDarkMode"
      ></i>
      <span class="fw-semibold  d-sm-inline">
        {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
      </span>
    </button>

  
    <button
      class="navbar-toggler ms-auto"
      type="button"
      (click)="toggleNavbar()"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div
      class="collapse navbar-collapse"
      [class.show]="!isCollapsed"
      id="mainNavbar"
    >

      <ul class="navbar-nav mb-2 mb-lg-0 ms-2 me-auto">
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

        <li class="nav-item">
          <a
            class="nav-link"
            [routerLink]="['/forum']"
            routerLinkActive="active"
            (click)="closeOnMobile()"
          >
            Forum
          </a>
        </li>
      </ul>

 
      <button
        type="button"
        class="btn btn-sm"
        [ngClass]="isDarkMode ? 'btn-outline-light' : 'btn-outline-danger'"
        (click)="logout()"
      >
        Logout
      </button>
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
  isDarkMode = false;

  constructor() {

    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      this.isDarkMode = false;
    }
    this.applyTheme();
  }

  private applyTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';

    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

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