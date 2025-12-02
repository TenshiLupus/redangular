import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuoteService } from '../services/quote-service';

@Component({
  selector: 'app-quote-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="container my-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">Create quote</h2>

            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="goBack()">
              Cancel
            </button>
          </div>

          @if (error()) {
          <div class="alert alert-danger">
            {{ error() }}
          </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Description -->
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
              <div class="invalid-feedback">Description is required</div>
              }
            </div>

            <!-- Author -->
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

            <!-- Actions -->
            <div class="d-flex align-items-center gap-2">
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
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
  styleUrl: './quote-create.css',
})
export class QuoteCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quoteService = inject(QuoteService);

  form = this.fb.nonNullable.group({
    description: ['', Validators.required],
    author: ['', Validators.required],
  });

  userId!: number;

  submitting = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.error.set('Invalid user id in route.');
      return;
    }

    this.userId = id;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();

    this.quoteService
      .createQuote({
        description: value.description,
        author: value.author,
        userId: this.userId, // backend can ignore this if it uses JWT claims
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/users', this.userId, 'quotes']);
        },
        error: (err) => {
          console.error('Failed to create quote', err);
          this.submitting.set(false);
          this.error.set('Failed to create quote.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/users', this.userId, 'quotes']);
  }
}
