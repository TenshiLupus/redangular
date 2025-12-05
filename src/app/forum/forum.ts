import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, catchError, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserQuote } from '../interfaces/userQuote';

interface ForumUser {
	id: number;
	name: string;
	quotes: UserQuote[];
}

@Component({
	selector: 'app-forum',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
    <main class="container my-4">
      <section class="card shadow-sm">
        <header class="card-header">
          <h1 class="h4 mb-1">
            Forum
          </h1>
          <p class="text-muted mb-0">
            Users and their quotes. Each section lists a user followed by their quotes.
          </p>
        </header>

        <div class="card-body">
          @if (loading()) {
            <div class="d-flex align-items-center">
              <div class="spinner-border spinner-border-sm me-2"></div>
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
                          <h2 class="h5 mb-0">
                            {{ u.name }}
                          </h2>
                          <p class="visually-hidden">
                            Quotes by {{ u.name }}
                          </p>
                        </div>
                      </header>

                      @if (u.quotes.length > 0) {
                        <section>
                          <ul class="list-unstyled mb-0">
                            @for (q of u.quotes; track q.id) {
                              <li class="mb-2">
                                <figure class="mb-0">
                                  <blockquote class="mb-1">
                                    <span class="visually-hidden">
                                      Quote:
                                    </span>
                                    “{{ q.description }}”
                                  </blockquote>
                                  <figcaption class="text-muted small">
                                    <span class="visually-hidden">
                                      Author:
                                    </span>
                                    — {{ q.author }}
                                  </figcaption>
                                </figure>
                              </li>
                            }
                          </ul>
                        </section>
                      } @else {
                        <p class="text-muted small mb-0">
                          No quotes yet for {{ u.name }}.
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
			.get<any[]>(`${environment.apiBaseUrl}/Users`)
			.pipe(
				switchMap((rawUsers) => {
					if (!rawUsers || rawUsers.length === 0) {
						return of([] as ForumUser[]);
					}

					const quoteRequests = rawUsers.map((u) =>
						this.http
							.get<UserQuote[]>(
								`${environment.apiBaseUrl}/Users/${u.id}/quotes`
							)
							.pipe(catchError(() => of([] as UserQuote[])))
					);

					return forkJoin(quoteRequests).pipe(
						map((quotesArray) =>
							rawUsers.map((u, index) => {
								const quotes = quotesArray[index] ?? [];
								const name =
									(u as any).username ??
									(u as any).userName ??
									`User ${u.id}`;

								return {
									id: u.id,
									name,
									quotes,
								} as ForumUser;
							})
						)
					);
				}),
				catchError((err) => {
					console.error('Failed to load forum data', err);
					this.error.set('Failed to load users and quotes.');
					return of([] as ForumUser[]);
				})
			)
			.subscribe((forumUsers) => {
				this.users.set(forumUsers);
				this.loading.set(false);
			});
	}
}
