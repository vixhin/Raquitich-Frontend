import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ObservacionesService {

  private api = 'http://localhost:8084';

  constructor(private http: HttpClient) {}

  // Estudiante: solo ve sus propias observaciones
  misObservaciones(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones/mis-observaciones`);
  }

  // Docente y directivo: ven todas
  listarTodas(): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.api}/observaciones`);
  }

  // Docente y directivo: registrar nueva observación
  registrar(data: any): Observable<Observacion> {
    return this.http.post<Observacion>(`${this.api}/observaciones`, data);
  }

  // Solo directivo: eliminar observación
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/observaciones/${id}`);
  }
}
