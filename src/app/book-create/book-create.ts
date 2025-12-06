import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../services/book-service';

@Component({
  selector: 'app-book-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="container my-4">
      <div class="card shadow-sm">
        <div class="card-body">
          

          @if (error()) {
          <div class="alert alert-danger">
            {{ error() }}
          </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input
                id="title"
                type="text"
                class="form-control"
                formControlName="title"
                [class.is-invalid]="form.controls.title.invalid && form.controls.title.touched"
              />

              @if (form.controls.title.invalid && form.controls.title.touched) {
              <div class="invalid-feedback">Title is required</div>
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

              @if (form.controls.author.invalid && form.controls.author.touched) {
              <div class="invalid-feedback">Author is required</div>
              }
            </div>

            <div class="mb-3">
              <label for="publishedDate" class="form-label">Published date</label>
              <input
                id="publishedDate"
                type="date"
                class="form-control"
                formControlName="publishedDate"
                [class.is-invalid]="
                  form.controls.publishedDate.invalid && form.controls.publishedDate.touched
                "
              />

              @if ( form.controls.publishedDate.invalid && form.controls.publishedDate.touched ) {
              <div class="invalid-feedback">Published date is required</div>
              }
            </div>

           
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
  styleUrl: './book-create.css',
})
export class BookCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    publishedDate: ['', Validators.required],
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

    this.bookService
      .createBook({
        title: value.title,
        author: value.author,
        publishedDate: value.publishedDate,
        userId: this.userId,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/users', this.userId, 'books']);
        },
        error: (err) => {
          console.error('Failed to create book', err);
          this.submitting.set(false);
          this.error.set('Failed to create book.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/users', this.userId, 'books']);
  }
}
