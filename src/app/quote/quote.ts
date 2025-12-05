import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserQuote } from '../interfaces/userQuote';
import { QuoteService } from '../services/quote-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-start gap-3">
      <div>
        <blockquote class="mb-1">
          “{{ quote.description }}”
        </blockquote>
        <div class="text-muted small">— {{ quote.author }}</div>

        <div class="mt-2 d-flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            (click)="edit()"
          >
            Edit
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            (click)="delete()"
          >
            Delete
          </button>
        </div>
      </div>

    
      <button
        type="button"
        class="btn btn-link p-0 favorite-toggle"
        (click)="toggleFavorite()"
      >
        <i class="fa-heart favorite-icon" [ngClass]="{'fa-solid text-danger': isFavorite(), 'fa-regular text-muted': !isFavorite()}"
        ></i>

        <span class="visually-hidden">
          {{ isFavorite() ? 'Remove from favorites' : 'Mark as favorite' }}
        </span>

      </button>
    </div>
  `,
  styleUrl: './quote.css',
})
export class QuoteComponent {
  @Input({ alias: 'quote', required: true }) quote!: UserQuote;
  @Output() deleted = new EventEmitter<number>();
  @Output() favoriteChanged = new EventEmitter<{ id: number; isFavorite: boolean }>();

  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private http = inject(HttpClient);


  isFavorite = signal(false);

  ngOnInit() {
    this.isFavorite.set(!!this.quote.isFavorite);
  }

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

  toggleFavorite(): void {
    const previous = this.isFavorite();
    const next = !previous;

    // optimistic UI update
    this.isFavorite.set(next);

    const payload: Partial<UserQuote> = {
      isFavorite: next,
    };

    this.http
      .patch<UserQuote>(`${environment.apiBaseUrl}/Quotes/${this.quote.id}/favorite`, payload)
      .subscribe({
        next: (updated) => {
          const final = !!updated.isFavorite;
          this.isFavorite.set(final);
          this.favoriteChanged.emit({ id: this.quote.id, isFavorite: final });
        },
        error: (err) => {
          console.error('Failed to update favorite', err);
          this.isFavorite.set(previous);
        },
      });
  }
}