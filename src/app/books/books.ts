import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserBook } from '../interfaces/userBook';
import { BookComponent } from '../book/book';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, BookComponent],
  template: `
    <section class="container my-4 mb-5">
      <div class="card shadow-sm">
        <!-- Header -->
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2 class="h5 mb-0">User Books</h2>

          <!-- Header button: visible from sm and up -->
          <button
            type="button"
            class="btn btn-primary btn-sm d-none d-sm-inline-flex align-items-center gap-1"
            (click)="goToCreate()"
          >
            <span class="fw-bold">+</span>
            <span>Add book</span>
          </button>
        </div>

        <!-- Body -->
        <div class="card-body">
          @if (loading()) {
          <div class="d-flex align-items-center">
            <div
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></div>
            <span>Loading books...</span>
          </div>
          } @else if (error()) {
          <div class="alert alert-danger mb-0">
            {{ error() }}
          </div>
          } @else { @if (books().length > 0) {
          <ul class="list-group list-group-flush">
            @for (b of books(); track b.id) {
            <li class="list-group-item">
              <app-book [book]="b" (deleted)="onBookDeleted($event)"></app-book>
            </li>
            }
          </ul>
          } @else {
          <p class="text-muted mb-0">This user has no books yet.</p>
          } }
        </div>
      </div>

      <!-- Sticky bottom button: only on extra-small screens -->
      <button
        type="button"
        class="btn btn-primary btn-lg d-sm-none fixed-bottom w-100 rounded-0 add-book-sticky"
        (click)="goToCreate()"
      >
        + Add book
      </button>
    </section>
  `,
  styleUrl: './books.css',
})
export class BooksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  // signals for state
  userId = signal<number | null>(null);
  books = signal<UserBook[]>([]);
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
    this.loadBooks();
  }

  onBookDeleted(id: number): void {
    this.books.update((current) => current.filter((b) => b.id !== id));
  }

  goToCreate(): void {
    // current route: /users/:id/books → go to /users/:id/books/create
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  private loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    const id = this.userId();
    if (id === null) return;

    this.http.get<UserBook[]>(`${environment.apiBaseUrl}/Users/${id}/books`).subscribe({
      next: (data) => {
        this.books.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load books', err);
        this.error.set('Failed to load books.');
        this.loading.set(false);
      },
    });
  }
}
