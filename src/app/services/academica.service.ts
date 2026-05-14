import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private api = 'http://localhost:8083';

  constructor(private http: HttpClient) {}

  // ── Asignaturas ────────────────────────────────────────────────────────────
  getAsignaturas(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(`${this.api}/asignaturas`);
  }

  crearAsignatura(data: Partial<Asignatura>): Observable<Asignatura> {
    return this.http.post<Asignatura>(`${this.api}/asignaturas`, data);
  }

  actualizarAsignatura(id: number, data: Partial<Asignatura>): Observable<Asignatura> {
    return this.http.put<Asignatura>(`${this.api}/asignaturas/${id}`, data);
  }

  eliminarAsignatura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/asignaturas/${id}`);
  }

  // ── Secciones ──────────────────────────────────────────────────────────────
  getSecciones(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.api}/secciones`);
  }

  crearSeccion(data: any): Observable<Seccion> {
    return this.http.post<Seccion>(`${this.api}/secciones`, data);
  }

  actualizarSeccion(id: number, data: any): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.api}/secciones/${id}`, data);
  }

  eliminarSeccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${id}`);
  }

  // ── Horarios ───────────────────────────────────────────────────────────────
  agregarHorario(seccionId: number, data: any): Observable<HorarioResponse> {
    return this.http.post<HorarioResponse>(`${this.api}/secciones/${seccionId}/horarios`, data);
  }

  eliminarHorario(seccionId: number, horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${seccionId}/horarios/${horarioId}`);
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────
  getInscritos(seccionId: number): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.api}/secciones/${seccionId}/inscripciones`);
  }

  inscribir(seccionId: number, estudianteUsername: string): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(`${this.api}/secciones/${seccionId}/inscripciones`, { estudianteUsername });
  }

  eliminarInscripcion(seccionId: number, inscripcionId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/secciones/${seccionId}/inscripciones/${inscripcionId}`);
  }
}
