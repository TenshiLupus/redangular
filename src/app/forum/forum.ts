import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserQuote } from '../interfaces/userQuote';

interface ApiUser {
  id: number;
  username: string;
  quotes: UserQuote[];
}

interface ForumUser {
  id: number;
  name: string;
  favoriteQuotes: UserQuote[];
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="container my-4">
      <section class="card shadow-sm">
        <header class="card-header">
          <h1 class="h4 mb-1">Forum</h1>
          <p class="text-muted mb-0">
            Users and their favorite quotes.
          </p>
        </header>

        <div class="card-body">
          @if (loading()) {
            <div class="d-flex align-items-center">
              <div
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></div>
              <span>Loading forum…</span>
            </div>
          } @else if (error()) {
            <div class="alert alert-danger mb-0">
              {{ error() }}
            </div>
          } @else {
            @if (users().length > 0) {
              <ul class="list-unstyled mb-0">
                @for (u of users(); track u.id) {
                  <li class="mb-3">
                    <article class="border rounded p-3">
                      <header
                        class="d-flex flex-column flex-sm-row
                               justify-content-between
                               align-items-start align-items-sm-center
                               gap-2 mb-2"
                      >
                        <div>
                          <h2 class="h5 mb-0">{{ u.name }}</h2>
                          <small class="text-muted">
                            Favorite quotes
                          </small>
                        </div>

                        
                      </header>

                      @if (u.favoriteQuotes.length > 0) {
                        <ul class="list-unstyled mb-0">
                          @for (q of u.favoriteQuotes; track q.id) {
                            <li class="mb-2">
                              <div class="d-flex align-items-start gap-2">
                                <i class="fa-solid fa-heart text-danger mt-1"></i>
                                <div>
                                  <blockquote class="mb-1">
                                    “{{ q.description }}”
                                  </blockquote>
                                  <div class="text-muted small">
                                    — {{ q.author }}
                                  </div>
                                </div>
                              </div>
                            </li>
                          }
                        </ul>
                      } @else {
                        <p class="text-muted small mb-0">
                          No favorite quotes yet for {{ u.name }}.
                        </p>
                      }
                    </article>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-muted mb-0">
                No users found.
              </p>
            }
          }
        </div>
      </section>
    </main>
  `,
  styleUrl: './forum.css',
})
export class ForumComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<ForumUser[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadForum();
  }

  private loadForum(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ApiUser[]>(`${environment.apiBaseUrl}/Users/favoriteQuotes`)
      .pipe(
        map((apiUsers) =>
          (apiUsers ?? []).map((u) => ({
            id: u.id,
            name: u.username ?? `User ${u.id}`,
            // backend already filtered to favorites & max 5
            favoriteQuotes: (u.quotes ?? []),
          }))
        ),
        catchError((err) => {
          console.error('Failed to load forum data', err);
          this.error.set('Failed to load users and favorite quotes.');
          return of([] as ForumUser[]);
        })
      )
      .subscribe((forumUsers) => {
        this.users.set(forumUsers);
        this.loading.set(false);
      });
  }
}