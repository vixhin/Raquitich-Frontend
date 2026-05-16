import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class GestionEstudiantesService {

  private api = 'http://localhost:8082';

  constructor(private http: HttpClient) {}

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.api}/estudiantes`);
  }

  miPerfil(): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.api}/estudiantes/mi-perfil`);
  }

  obtener(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.api}/estudiantes/${id}`);
  }

  crear(data: any): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.api}/estudiantes`, data);
  }

  actualizar(id: number, data: any): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.api}/estudiantes/${id}`, data);
  }

  desactivar(id: number): Observable<Estudiante> {
    return this.http.delete<Estudiante>(`${this.api}/estudiantes/${id}`);
  }
}
