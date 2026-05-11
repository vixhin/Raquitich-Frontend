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

  nombre: string = '';
  rol: string    = '';
  inicial: string = '';

  activeMenu: string = '';

  modulos = [
    {
      titulo: 'Gestión Estudiantes',
      descripcion: 'Administración completa de estudiantes y fichas académicas.',
      icono: 'school',
      color: 'blue'
    },
    {
      titulo: 'Gestión Académica',
      descripcion: 'Control de asignaturas, docentes y horarios.',
      icono: 'menu_book',
      color: 'green'
    },
    {
      titulo: 'Calificaciones',
      descripcion: 'Notas, evaluaciones y seguimiento académico.',
      icono: 'grading',
      color: 'orange'
    },
    {
      titulo: 'Mensajería',
      descripcion: 'Comunicación institucional entre usuarios.',
      icono: 'forum',
      color: 'blue'
    },
    {
      titulo: 'Calendario',
      descripcion: 'Eventos académicos y actividades importantes.',
      icono: 'calendar_month',
      color: 'green'
    },
    {
      titulo: 'Reportes',
      descripcion: 'Reportes administrativos y estadísticas.',
      icono: 'bar_chart',
      color: 'orange'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.nombre  = this.authService.getNombre();
    this.rol     = this.formatearRol(this.authService.getRole());
    this.inicial = this.nombre.charAt(0).toUpperCase();
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
