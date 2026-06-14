import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Taller {
  idTaller: number;
  nombreTaller: string;
  descripcionTaller: string;
  cuposTaller: number;
}

export interface TallerRequest {
  nombreTaller: string;
  descripcionTaller: string;
  cuposTaller: number;
}

@Injectable({
  providedIn: 'root'
})
export class TallerService {

  private apiUrl = 'http://54.196.255.39:8085/api/talleres';

  constructor(private http: HttpClient) {}

  listar(): Observable<Taller[]> {
    return this.http.get<Taller[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Taller> {
    return this.http.get<Taller>(`${this.apiUrl}/${id}`);
  }

  crear(taller: TallerRequest): Observable<Taller> {
    return this.http.post<Taller>(this.apiUrl, taller);
  }

  actualizar(id: number, taller: TallerRequest): Observable<Taller> {
    return this.http.put<Taller>(`${this.apiUrl}/${id}`, taller);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  inscribir(id: number): Observable<Taller> {
    return this.http.post<Taller>(`${this.apiUrl}/${id}/inscribir`, {});
  }
}
