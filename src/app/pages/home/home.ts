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
  esDocente:    boolean = false;
  esDirectivo:  boolean = false;
  tituloPortal: string  = '';

  activeMenu: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const role        = this.authService.getRole();
    this.nombre       = this.authService.getNombre();
    this.rol          = this.formatearRol(role);
    this.inicial      = this.nombre.charAt(0).toUpperCase();
    this.esEstudiante = role === 'ROLE_ESTUDIANTE';
    this.esDocente    = role === 'ROLE_DOCENTE';
    this.esDirectivo  = role === 'ROLE_DIRECTIVO' || role === 'ROLE_ADMIN';
    this.tituloPortal = this.esEstudiante ? 'Portal Estudiantil'
                      : this.esDocente    ? 'Panel Docente'
                      : 'Panel Administrativo';
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
