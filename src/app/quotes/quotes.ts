import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserQuote } from '../interfaces/userQuote';
import { QuoteComponent } from '../quote/quote';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, QuoteComponent],
  template: `
    <section class="container my-4 mb-5">
      <div class="card shadow-sm">
        
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2 class="h5 mb-0">User Quotes</h2>

          
          <button
            type="button"
            class="btn btn-primary btn-sm d-none d-sm-inline-flex align-items-center gap-1"
            (click)="goToCreate()"
          >
            <span class="fw-bold">+</span>
            <span>Add quote</span>
          </button>
        </div>

        
        <div class="card-body">
          @if (loading()) {
          <div class="d-flex align-items-center">
            <div
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></div>
            <span>Loading quotes...</span>
          </div>
          } @else if (error()) {
          <div class="alert alert-danger mb-0">
            {{ error() }}
          </div>
          } @else { @if (quotes().length > 0) {
          <ul class="list-group list-group-flush">
            @for (q of quotes(); track q.id) {
            <li class="list-group-item">
              <app-quote [quote]="q" (deleted)="onQuoteDeleted($event)"></app-quote>
            </li>
            }
          </ul>
          } @else {
          <p class="text-muted mb-0">This user has no quotes yet.</p>
          } }
        </div>
      </div>

      
      <button
        type="button"
        class="btn btn-primary btn-lg d-sm-none fixed-bottom w-100 rounded-0 add-quote-sticky"
        (click)="goToCreate()"
      >
        + Add quote
      </button>
    </section>
  `,
  styleUrl: './quotes.css',
})
export class QuotesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  userId = signal<number | null>(null);
  quotes = signal<UserQuote[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.error.set('Invalid or missing user id in route.');
      return;
    }

    this.userId.set(id);
    this.loadQuotes();
  }

  private loadQuotes(): void {
    this.loading.set(true);
    this.error.set(null);

    const id = this.userId();
    if (id === null) return;

    this.http.get<UserQuote[]>(`${environment.apiBaseUrl}/Users/${id}/quotes`).subscribe({
      next: (data) => {
        this.quotes.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load quotes', err);
        this.error.set('Failed to load quotes.');
        this.loading.set(false);
      },
    });
  }

  onQuoteDeleted(id: number): void {
    this.quotes.update((current) => current.filter((q) => q.id !== id));
  }

  goToCreate(): void {
    
    this.router.navigate(['create'], { relativeTo: this.route });
  }
}
