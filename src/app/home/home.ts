import { Component, inject } from '@angular/core';
import { BookComponent } from '../book/book';
import { UserBook } from '../interfaces/userBook';
import { BookService } from '../services/book-service';

@Component({
  selector: 'app-home',
  imports: [BookComponent],
  template: `
    <section>
      <form>
        <input type="text" />
        <button type="button">Search</button>
      </form>
    </section>
  `,
  styleUrl: './home.css',
})
export class HomeComponent {
  constructor() {}
}
