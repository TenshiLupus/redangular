import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserBook } from '../interfaces/userBook';
import { BookService } from '../services/book-service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [DatePipe],
  template: `
  
    <div
      class="d-flex justify-content-between
             align-items-start align-items-sm-center"
    >
      <div class="flex-grow-1">
        <div class="fw-semibold">
          {{ book.title }}
        </div>
        <div class="text-muted small">
          by {{ book.author }} •
          {{ book.publishedDate | date : 'yyyy-MM-dd' }}
        </div>
      </div>

  
      <div class="d-none d-sm-flex gap-2 ms-sm-3">
        <button type="button" class="btn btn-outline-primary btn-sm" (click)="edit()">Edit</button>
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="delete()">
          Delete
        </button>
      </div>
    </div>


    <div class="d-grid gap-2 d-sm-none mt-2">
      <button type="button" class="btn btn-outline-primary" (click)="edit()">Edit</button>
      <button type="button" class="btn btn-outline-danger" (click)="delete()">Delete</button>
    </div>
  `,
})
export class BookComponent {
  @Input({ alias: 'book', required: true }) book!: UserBook;
  @Output() deleted = new EventEmitter<number>();

  private router = inject(Router);
  private bookService = inject(BookService);

  edit() {
    this.router.navigate(['/books', this.book.id, 'edit']);
  }

  delete(): void {
    const confirmed = confirm(`Delete "${this.book.title}"?`);
    if (!confirmed) return;

    this.bookService.deleteBook(this.book.id).subscribe({
      next: () => this.deleted.emit(this.book.id),
      error: (err) => console.error('Failed to delete book', err),
    });
  }
}
