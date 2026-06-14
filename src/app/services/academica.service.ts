import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthService } from './auth';

export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  creditos: number;
  activa: boolean;
}

export interface HorarioResponse {
  id: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  sala: string;
}

export interface Seccion {
  id: number;
  asignaturaId: number;
  asignaturaCodigo: string;
  asignaturaNombre: string;
  periodo: string;
  cupoMaximo: number;
  docenteUsername: string;
  activa: boolean;
  cantidadInscritos: number;
  horarios: HorarioResponse[];
}

export interface Inscripcion {
  id: number;
  seccionId: number;
  estudianteUsername: string;
  fechaInscripcion: string;
  activa: boolean;
}

@Injectable({ providedIn: 'root' })
export class AcademicaService {

  private api = 'http://54.196.255.39:8083';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // ── Asignaturas ────────────────────────────────────────────────────────────
  getAsignaturas(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(`${this.api}/asignaturas`, { headers: this.headers() }).pipe(timeout(10000));
  }

  crearAsignatura(data: Partial<Asignatura>): Observable<Asignatura> {
    return this.http.post<Asignatura>(`${this.api}/asignaturas`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  actualizarAsignatura(id: number, data: Partial<Asignatura>): Observable<Asignatura> {
    return this.http.put<Asignatura>(`${this.api}/asignaturas/${id}`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminarAsignatura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/asignaturas/${id}`, { headers: this.headers() }).pipe(timeout(10000));
  }

  // ── Secciones ──────────────────────────────────────────────────────────────
  getSecciones(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.api}/secciones`, { headers: this.headers() }).pipe(timeout(10000));
  }

  crearSeccion(data: any): Observable<Seccion> {
    return this.http.post<Seccion>(`${this.api}/secciones`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  actualizarSeccion(id: number, data: any): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.api}/secciones/${id}`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminarSeccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${id}`, { headers: this.headers() }).pipe(timeout(10000));
  }

  // ── Horarios ───────────────────────────────────────────────────────────────
  agregarHorario(seccionId: number, data: any): Observable<HorarioResponse> {
    return this.http.post<HorarioResponse>(`${this.api}/secciones/${seccionId}/horarios`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminarHorario(seccionId: number, horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${seccionId}/horarios/${horarioId}`, { headers: this.headers() }).pipe(timeout(10000));
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────
  getInscritos(seccionId: number): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.api}/secciones/${seccionId}/inscripciones`, { headers: this.headers() }).pipe(timeout(10000));
  }

  inscribir(seccionId: number, estudianteUsername: string): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(`${this.api}/secciones/${seccionId}/inscripciones`, { estudianteUsername }, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminarInscripcion(seccionId: number, inscripcionId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${seccionId}/inscripciones/${inscripcionId}`, { headers: this.headers() }).pipe(timeout(10000));
  }

  misSeccionesDocente(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.api}/secciones/mis-secciones-docente`, { headers: this.headers() }).pipe(timeout(10000));
  }

  misSeccionesEstudiante(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.api}/secciones/mis-secciones`, { headers: this.headers() }).pipe(timeout(10000));
  }
}
