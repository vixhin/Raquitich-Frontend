import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nombre: string;
  role: string;
  enabled: boolean;
}

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  nombre: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private api = 'http://54.235.3.218:8081';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.api}/admin/usuarios`, { headers: this.headers() });
  }

  crear(data: AdminCreateUserRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.api}/admin/usuarios`, data, { headers: this.headers() });
  }

  cambiarRol(id: number, role: string): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.api}/admin/usuarios/${id}/rol`, { role }, { headers: this.headers() });
  }

  cambiarEstado(id: number, enabled: boolean): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.api}/admin/usuarios/${id}/estado`, { enabled }, { headers: this.headers() });
  }
}
