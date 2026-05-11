import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
      username: identifier,   // el backend acepta username o email
      password: password
    }).pipe(
      tap(response => {
        localStorage.setItem('token',    response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('nombre',   response.nombre);
        localStorage.setItem('role',     response.role);
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
