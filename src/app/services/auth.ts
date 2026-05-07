import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(email: string, password: string): Observable<any> {

    // USUARIO MOCK
    if (email === 'admin@raquitich.cl') {

      if (password === '1234') {
        return of({
          token: 'fake-jwt-token'
        });
      }

      return throwError(() => ({
        status: 401
      }));
    }

    return throwError(() => ({
      status: 404
    }));
  }
}