import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthService } from './auth';

export interface Evento {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  creadoPor: string;
  estudianteUsername: string;
  color: string;
  creadoEn: string;
}

export interface EventoRequest {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  horaInicio?: string;
  horaFin?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {

  private api = 'http://localhost:8086';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.api}/eventos`, { headers: this.headers() }).pipe(timeout(10000));
  }

  crearInstitucional(data: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(`${this.api}/eventos/institucional`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  crearPublico(data: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(`${this.api}/eventos/publico`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  crearPersonal(data: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(`${this.api}/eventos/personal`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  actualizar(id: number, data: Partial<EventoRequest>): Observable<Evento> {
    return this.http.put<Evento>(`${this.api}/eventos/${id}`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/eventos/${id}`, { headers: this.headers() }).pipe(timeout(10000));
  }
}
