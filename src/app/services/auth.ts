import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../interfaces/loginResponse';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/Authentication`;

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<string | null>(null);
  userId = signal<number | null>(null);

  constructor(private http: HttpClient) {
    // Optional: restore login state from localStorage on refresh
    const storedId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (storedId && token) {
      const id = Number(storedId);
      if (!Number.isNaN(id)) {
        this.userId.set(id);
        this.isLoggedIn.set(true);
      }
    }
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
    });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          console.log('login response', res);
          this.isLoggedIn.set(true);
          this.currentUser.set(username);
          this.userId.set(res.userId);

          localStorage.setItem('token', res.token);
          localStorage.setItem('userId', String(res.userId));
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.userId.set(null);

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }
}
