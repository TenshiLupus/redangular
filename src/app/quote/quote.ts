import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserQuote } from '../interfaces/userQuote';
import { QuoteService } from '../services/quote-service';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [],
  template: `
    <!-- Top row: text + DESKTOP/TABLET buttons -->
    <div
      class="d-flex justify-content-between
             align-items-start align-items-sm-center"
    >
      <div class="flex-grow-1">
        <div class="mb-1 fst-italic">“{{ quote.description }}”</div>
        <div class="text-muted small">— {{ quote.author }}</div>
      </div>

      <!-- Desktop / tablet buttons (sm and up) -->
      <div class="d-none d-sm-flex gap-2 ms-sm-3">
        <button type="button" class="btn btn-outline-primary btn-sm" (click)="edit()">Edit</button>
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="delete()">
          Delete
        </button>
      </div>
    </div>

    <!-- Mobile buttons (xs only) -->
    <div class="d-grid gap-2 d-sm-none mt-2">
      <button type="button" class="btn btn-outline-primary" (click)="edit()">Edit</button>
      <button type="button" class="btn btn-outline-danger" (click)="delete()">Delete</button>
    </div>
  `,
})
export class QuoteComponent {
  @Input({ alias: 'quote', required: true }) quote!: UserQuote;
  @Output() deleted = new EventEmitter<number>();

  private router = inject(Router);
  private quoteService = inject(QuoteService);

  edit(): void {
    this.router.navigate(['/quotes', this.quote.id, 'edit']);
  }

  delete(): void {
    const confirmed = confirm(`Delete this quote?\n\n"${this.quote.description}"`);
    if (!confirmed) return;

    this.quoteService.deleteQuote(this.quote.id).subscribe({
      next: () => this.deleted.emit(this.quote.id),
      error: (err) => console.error('Failed to delete quote', err),
    });
  }
}
