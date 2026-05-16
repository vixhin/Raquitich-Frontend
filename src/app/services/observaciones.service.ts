import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Observacion {
  id: number;
  estudianteUsername: string;
  autorUsername: string;
  tipo: string;
  titulo: string;
  contenido: string;
  fechaObservacion: string;
  creadoEn: string;
}

export type TipoObservacion = 'ACADEMICA' | 'CONDUCTUAL' | 'POSITIVA' | 'SEGUIMIENTO' | 'GENERAL';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {

  private api = 'http://localhost:8084';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones`);
  }

  listarPorEstudiante(username: string, tipo?: string): Observable<Observacion[]> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<Observacion[]>(`${this.api}/observaciones/estudiante/${username}`, { params });
  }

  misObservaciones(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones/mis-observaciones`);
  }

  misRegistros(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones/mis-registros`);
  }

  registrar(data: any): Observable<Observacion> {
    return this.http.post<Observacion>(`${this.api}/observaciones`, data);
  }

  actualizar(id: number, data: any): Observable<Observacion> {
    return this.http.put<Observacion>(`${this.api}/observaciones/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/observaciones/${id}`);
  }
}
