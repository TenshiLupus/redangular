import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserQuote } from '../interfaces/userQuote';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);

  getQuote(id: number): Observable<UserQuote> {
    return this.http.get<UserQuote>(`${environment.apiBaseUrl}/Quotes/${id}`);
  }

  updateQuote(id: number, data: Partial<UserQuote>): Observable<UserQuote> {
    return this.http.put<UserQuote>(`${environment.apiBaseUrl}/Quotes/${id}`, data);
  }

  deleteQuote(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/Quotes/${id}`);
  }

  createQuote(data: {
    description: string;
    userId?: number;
    author?: string;
  }): Observable<UserQuote> {
    return this.http.post<UserQuote>(`${environment.apiBaseUrl}/Quotes`, data);
  }
}
