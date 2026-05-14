import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, catchError, throwError } from 'rxjs';

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  nombre: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username: identifier,
      password: password
    }).pipe(
      timeout(8000),   // máximo 8 segundos — si no responde, lanza error
      tap(response => {
        localStorage.setItem('token',    response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('nombre',   response.nombre);
        localStorage.setItem('role',     response.role);
      }),
      catchError(err => {
        // Timeout de RxJS llega como TimeoutError (status undefined)
        if (err.name === 'TimeoutError') {
          return throwError(() => ({ status: 0 }));
        }
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('nombre');
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getNombre(): string {
    return localStorage.getItem('nombre') ?? 'Usuario';
  }

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
