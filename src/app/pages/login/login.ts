import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

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

  constructor(private authService: AuthService) {}

  login() {
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Login OK', res);
        localStorage.setItem('token', res.token);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error = 'Cuenta no existente';
        } else if (err.status === 401) {
          this.error = 'Contraseña incorrecta';
        } else {
          this.error = 'Error del servidor';
        }
      }
    });
  }
}