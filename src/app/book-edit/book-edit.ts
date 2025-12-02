import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserBook } from '../interfaces/userBook';
import { BookService } from '../services/book-service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="container my-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="h5 mb-3">Edit book</h2>

          @if (loading()) {
          <div class="d-flex align-items-center">
            <div
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></div>
            <span>Loading book...</span>
          </div>
          } @else if (error()) {
          <div class="alert alert-danger mb-0">
            {{ error() }}
          </div>
          } @else {
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
              @if ( form.controls.title.invalid && form.controls.title.touched ) {
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
              @if ( form.controls.author.invalid && form.controls.author.touched ) {
              <div class="invalid-feedback">Author is required</div>
              }
            </div>

           
            <div class="mb-3">
              <label for="publishedDate" class="form-label"> Published date </label>
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

          
            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-start">
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
          }
        </div>
      </div>
    </section>
  `,
})
export class BookEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private auth = inject(AuthService);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    publishedDate: ['', Validators.required],
  });

  bookId!: number;

  // signals for state
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.error.set('Invalid book id in route.');
      return;
    }

    this.bookId = id;
    this.loadBook();
  }

  private loadBook(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService.getBook(this.bookId).subscribe({
      next: (book: UserBook) => {
        this.loading.set(false);

        this.form.patchValue({
          title: book.title,
          author: book.author,
          
          publishedDate: (book.publishedDate as any)?.toString().substring(0, 10),
        });
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.error.set('Failed to load book.');
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

    const payload: Partial<UserBook> = {
      title: value.title,
      author: value.author,
      publishedDate: value.publishedDate,
    };

    this.bookService.updateBook(this.bookId, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate([`/users/${this.auth.userId()}/books`]);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        this.error.set('Failed to update book.');
      },
    });
  }

  goBack(): void {
    this.router.navigate([`/users/${this.auth.userId()}/books`]);
  }
}
