import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth';
import { MenuComponent } from './menu/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MenuComponent],
  template: `
    <main>
      @if (auth.userId() !== null) {
      <app-menu [userId]="auth.userId()"></app-menu>
      }

      <section>
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrl: './app.css',
})
export class App {
  auth = inject<AuthService>(AuthService);
  protected readonly title = signal('books-frontend');
}
