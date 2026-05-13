import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  email: string       = '';
  password: string    = '';
  error: string       = '';
  errorDetail: string = '';
  cargando: boolean   = false;
  shake: boolean      = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.mostrarError({ status: 400 });
      return;
    }

    this.cerrarError();
    this.cargando = true;
    this.cdr.detectChanges();

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.mostrarError(err);
      }
    });
  }

  private mostrarError(err: any) {
    const status = err?.status ?? 0;

    if (status === 409 || status === 401) {
      this.error       = 'Credenciales incorrectas';
      this.errorDetail = 'El correo o la contraseña ingresados no son válidos.';
    } else if (status === 400) {
      this.error       = 'Campos incompletos';
      this.errorDetail = 'Por favor ingresa tu correo y contraseña.';
    } else if (status === 0) {
      this.error       = 'Sin conexión al servidor';
      this.errorDetail = 'Verifica que el backend esté corriendo en el puerto 8081.';
    } else {
      this.error       = 'Error inesperado';
      this.errorDetail = `Código: ${status}. Intenta nuevamente.`;
    }

    // Forzar detección antes de activar shake
    this.shake = false;
    this.cdr.detectChanges();

    // Pequeño delay para que Angular procese el false antes del true
    setTimeout(() => {
      this.shake = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.shake = false;
        this.cdr.detectChanges();
      }, 500);
    }, 20);
  }

  cerrarError() {
    this.error       = '';
    this.errorDetail = '';
    this.shake       = false;
    this.cdr.detectChanges();
  }
}
