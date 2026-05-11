import { Component } from '@angular/core';
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

  email: string    = '';
  password: string = '';
  error: string    = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    this.error    = '';
    this.cargando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401 || err.status === 409) {
          this.error = 'Correo o contraseña incorrectos';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar al servidor';
        } else {
          this.error = 'Error al iniciar sesión, intente nuevamente';
        }
      }
    });
  }
}
