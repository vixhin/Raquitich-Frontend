import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  nombre: string      = '';
  rol: string         = '';
  inicial: string     = '';
  esEstudiante: boolean = false;
  tituloPortal: string  = '';

  activeMenu: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.nombre       = this.authService.getNombre();
    this.rol          = this.formatearRol(this.authService.getRole());
    this.inicial      = this.nombre.charAt(0).toUpperCase();
    this.esEstudiante = this.authService.getRole() === 'ROLE_ESTUDIANTE';
    this.tituloPortal = this.esEstudiante ? 'Portal Estudiantil' : 'Panel Administrativo';
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? '' : menu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private formatearRol(role: string): string {
    const roles: Record<string, string> = {
      'ROLE_ADMIN':      'Administrador',
      'ROLE_DIRECTIVO':  'Director Académico',
      'ROLE_DOCENTE':    'Docente',
      'ROLE_ESTUDIANTE': 'Estudiante'
    };
    return roles[role] ?? role;
  }
}
