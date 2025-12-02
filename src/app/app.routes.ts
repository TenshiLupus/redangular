import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { HomeComponent } from './home/home';
import { QuotesComponent } from './quotes/quotes';
import { BookEditComponent } from './book-edit/book-edit';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { AuthService } from './services/auth';
import { BooksComponent } from './books/books';
import { QuoteEditComponent } from './quote-edit/quote-edit';
import { BookCreateComponent } from './book-create/book-create';
import { QuoteCreateComponent } from './quote-create/quote-create';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
   
    canActivate: [
      () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        if (auth.isLoggedIn()) {
          
          return router.parseUrl('/books');
        }

        
        return router.parseUrl('/login');
      },
    ],
    // This component will never actually render because guard always redirects,
    // but Angular requires something here:
    component: HomeComponent,
  },
  {
    path: 'bookedit/:id',
    component: BookEditComponent,
    title: 'book edit',
  },
  // {
  //   path: 'quotes',
  //   component: QuotesComponent,
  //   title: 'Quotes page',
  // },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'users/:id/quotes',
    component: QuotesComponent,
    title: 'Quotes page',
  },
  {
    path: 'users/:id/books',
    component: BooksComponent,
    title: 'User Books',
  },
  { path: 'users/:id/books/create', component: BookCreateComponent },
  { path: 'books', component: BooksComponent },
  { path: 'books/:id/edit', component: BookEditComponent },
  
  { path: 'users/:userId/quotes', component: QuotesComponent },
  { path: 'quotes/:id/edit', component: QuoteEditComponent },
  { path: 'users/:id/quotes/create', component: QuoteCreateComponent },
];
