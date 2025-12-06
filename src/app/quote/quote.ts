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
		<div class="d-flex align-items-center py-3">
  
      <div class="flex-grow-1">
        <blockquote class="mb-1">
          “{{ quote.description }}”
        </blockquote>
        <div class="text-muted small">
          — {{ quote.author }}
        </div>
      </div>


      <button
        type="button"
        class="btn p-0 border-0 bg-transparent ms-2 favorite-toggle"
        (click)="toggleFavorite()"
      >
        <i
          class="fa-heart favorite-icon fs-2"
          [ngClass]="{
            'fa-solid text-danger': isFavorite(),
            'fa-regular text-muted': !isFavorite()
          }"
        ></i>
      </button>


      <div class="d-none d-sm-flex gap-2 ms-sm-3">
        <button
          type="button"
          class="btn btn-outline-primary quote-action-btn"
          (click)="edit()"
        >
          Edit
        </button>

        <button
          type="button"
          class="btn btn-outline-danger quote-action-btn"
          (click)="delete()"
        >
          Delete
        </button>
      </div>
    </div>

   
    <div class="d-grid gap-2 d-sm-none mt-2">
      <button
        type="button"
        class="btn btn-outline-primary quote-action-btn"
        (click)="edit()"
      >
        Edit
      </button>

      <button
        type="button"
        class="btn btn-outline-danger quote-action-btn"
        (click)="delete()"
      >
        Delete
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

		const newFavoriteState = !this.isFavorite();

		const payload: Partial<UserQuote> = {
			isFavorite: newFavoriteState,
		};

		this.http
			.patch<{ id: number; isFavorite: boolean }>(
				`${environment.apiBaseUrl}/Quotes/${this.quote.id}/favorite`,
				payload
			).subscribe({
				next: (updated) => {

					const updatedFavoriteState = !!updated.isFavorite;
					this.isFavorite.set(updatedFavoriteState);
					this.favoriteChanged.emit({ id: this.quote.id, isFavorite: updatedFavoriteState });
				},
				error: (err) => {
					console.error('Failed to update favorite', err);

					const msg =
						err?.error?.message ??
						'Could not update favorite. You can only have 5 favorites.';
					alert(msg);
				},
			});
	}
}