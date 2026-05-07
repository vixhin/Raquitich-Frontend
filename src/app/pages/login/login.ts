import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  error: string = '';

  // USUARIO FALSO TEMPORAL
  usuarioMock = {
    email: 'admin@raquitich.cl',
    password: '1234'
  };

  constructor(private router: Router) {}

  login() {

    this.error = '';

    // VALIDAR CORREO
    if (this.email !== this.usuarioMock.email) {
      this.error = 'Cuenta no existente';
      return;
    }

    // VALIDAR PASSWORD
    if (this.password !== this.usuarioMock.password) {
      this.error = 'Contraseña incorrecta';
      return;
    }

    // LOGIN CORRECTO
    localStorage.setItem('token', 'fake-jwt-token');

    // REDIRIGE AL HOME
    this.router.navigate(['/home']);
  }
}