import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Estudiante {
  id: number;
  username: string;
  rut: string | null;
  email: string;
  nombre: string;
  fechaNacimiento: string | null;
  numeroMatricula: string | null;
  carrera: string | null;
  anioIngreso: number | null;
  activo: boolean;
  creadoEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class GestionEstudiantesService {

  private api = 'http://localhost:8082';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.api}/estudiantes`, { headers: this.headers() });
  }

  miPerfil(): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.api}/estudiantes/mi-perfil`, { headers: this.headers() });
  }

  obtener(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.api}/estudiantes/${id}`, { headers: this.headers() });
  }

  crear(data: Partial<Estudiante>): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.api}/estudiantes`, data, { headers: this.headers() });
  }

  actualizar(id: number, data: Partial<Estudiante>): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.api}/estudiantes/${id}`, data, { headers: this.headers() });
  }

  desactivar(id: number): Observable<Estudiante> {
    return this.http.delete<Estudiante>(`${this.api}/estudiantes/${id}`, { headers: this.headers() });
  }
}
