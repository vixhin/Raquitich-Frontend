import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthService } from './auth';

export interface Observacion {
  id: number;
  estudianteUsername: string;
  docenteUsername: string;
  tipo: string;
  titulo: string;
  contenido: string;
  fechaObservacion: string | null;
  creadoEn: string;
}

export interface ObservacionRequest {
  estudianteUsername: string;
  tipo: string;
  titulo: string;
  contenido: string;
  fechaObservacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ObservacionesService {

  private api = 'http://localhost:8084';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  listarTodas(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones`, { headers: this.headers() }).pipe(timeout(10000));
  }

  misObservaciones(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones/mis-observaciones`, { headers: this.headers() }).pipe(timeout(10000));
  }

  registrar(data: ObservacionRequest): Observable<Observacion> {
    return this.http.post<Observacion>(`${this.api}/observaciones`, data, { headers: this.headers() }).pipe(timeout(10000));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/observaciones/${id}`, { headers: this.headers() }).pipe(timeout(10000));
  }
}
