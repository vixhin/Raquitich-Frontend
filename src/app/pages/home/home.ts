import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  // USUARIO
  usuario = {
    nombre: 'Administrador',
    rol: 'Director Académico'
  };

  // MENU ACTIVO
  activeMenu: string = '';

  // ABRIR / CERRAR MENUS
  toggleMenu(menu: string) {
    if (this.activeMenu === menu) {
      this.activeMenu = '';
    } else {
      this.activeMenu = menu;
    }
  }

  // TARJETAS HOME
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

}