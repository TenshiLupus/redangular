import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserBook } from '../interfaces/userBook';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  getAllBooks(): Observable<UserBook[]> {
    return this.http.get<UserBook[]>(`${environment.apiBaseUrl}/Books`);
  }

  getBook(id: number): Observable<UserBook> {
    return this.http.get<UserBook>(`${environment.apiBaseUrl}/Books/${id}`);
  }

  updateBook(id: number, data: Partial<UserBook>): Observable<UserBook> {
    return this.http.put<UserBook>(`${environment.apiBaseUrl}/Books/${id}`, data);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/Books/${id}`);
  }

  createBook(data: {
    title: string;
    author: string;
    publishedDate: string;
    userId: number;
  }): Observable<UserBook> {
    return this.http.post<UserBook>(`${environment.apiBaseUrl}/Books`, data);
  }
}
