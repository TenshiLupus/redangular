import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserQuote } from '../interfaces/userQuote';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';
@Component({
	selector: 'app-quote-edit',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<section class="container my-4">
			<div class="card shadow-sm">
				<section class="card-body">
					<h2 class="h5 mb-3">Edit quote</h2>

					@if (loading()) {
					<div class="d-flex align-items-center">
						<div
							class="spinner-border spinner-border-sm me-2"
							role="status"
							aria-hidden="true"
						></div>
						<span>Loading quote...</span>
					</div>
					} @else if (error()) {
					<div class="alert alert-danger mb-0">
						{{ error() }}
					</div>
					} @else {
					<form [formGroup]="form" (ngSubmit)="onSubmit()">
						<div class="mb-3">
							<label for="description" class="form-label">Description</label>
							<textarea
								id="description"
								rows="3"
								class="form-control"
								formControlName="description"
								[class.is-invalid]="
									form.controls.description.invalid && form.controls.description.touched
								"
							></textarea>

							@if ( form.controls.description.invalid && form.controls.description.touched ) {
							<p class="invalid-feedback">Description is required</p>
							}
						</div>

						<div class="mb-3">
							<label for="author" class="form-label">Author</label>
							<input
								id="author"
								type="text"
								class="form-control"
								formControlName="author"
								[class.is-invalid]="form.controls.author.invalid && form.controls.author.touched"
							/>

							@if ( form.controls.author.invalid && form.controls.author.touched ) {
							<div class="invalid-feedback">Author is required</div>
							}
						</div>

						<section class="d-flex flex-column flex-sm-row gap-2 justify-content-start">
							<button
								type="submit"
								class="btn btn-primary"
								[disabled]="form.invalid || submitting()"
							>
								@if (submitting()) {
								<span
									class="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
								} Save
							</button>

							<button type="button" class="btn btn-outline-secondary" (click)="goBack()">
								Cancel
							</button>
						</section>
					</form>
					}
				</section>
			</div>
		</section>
	`,
	styleUrl: './quote-edit.css',
})
export class QuoteEditComponent implements OnInit {
	private fb = inject(FormBuilder);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private http = inject(HttpClient);
	private auth = inject(AuthService);

	form = this.fb.nonNullable.group({
		description: ['', Validators.required],
		author: ['', Validators.required],
	});

	quoteId!: number;

	loading = signal(false);
	submitting = signal(false);
	error = signal<string | null>(null);

	ngOnInit(): void {
		const idParam = this.route.snapshot.paramMap.get('id');
		const id = idParam ? Number(idParam) : NaN;

		if (!id || Number.isNaN(id)) {
			this.error.set('Invalid quote id in route.');
			return;
		}

		this.quoteId = id;
		this.loadQuote();
	}

	private loadQuote(): void {
		this.loading.set(true);
		this.error.set(null);

		this.http.get<UserQuote>(`${environment.apiBaseUrl}/Quotes/${this.quoteId}`).subscribe({
			next: (quote) => {
				this.loading.set(false);
				this.form.patchValue({
					description: quote.description ?? '',
					author: quote.author ?? '',
				});
			},
			error: (err) => {
				console.error('Failed to load quote', err);
				this.loading.set(false);
				this.error.set('Failed to load quote.');
			},
		});
	}

	onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.submitting.set(true);
		this.error.set(null);

		const value = this.form.getRawValue();
		const payload: Partial<UserQuote> = {
			description: value.description,
			author: value.author,
		};

		this.http
			.put<UserQuote>(`${environment.apiBaseUrl}/Quotes/${this.quoteId}`, payload)
			.subscribe({
				next: () => {
					this.submitting.set(false);
					this.router.navigate(['/users', this.auth.userId(), 'quotes']);
				},
				error: (err) => {
					console.error('Failed to update quote', err);
					this.submitting.set(false);
					this.error.set('Failed to update quote.');
				},
			});
	}

	goBack(): void {
		this.router.navigate(['/users', this.auth.userId(), 'quotes']);
	}
}
