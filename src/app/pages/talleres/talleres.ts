import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TallerService, Taller, TallerRequest } from '../../services/taller';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './talleres.html',
  styleUrls: ['./talleres.scss']
})
export class TalleresComponent implements OnInit {

  nombre: string    = '';
  rol: string       = '';
  inicial: string   = '';
  tituloPortal: string = '';

  esEstudiante: boolean = false;
  esAdmin: boolean      = false;

  activeMenu: string = 'talleres';

  talleres: Taller[] = [];
  cargando: boolean  = false;
  error: string      = '';
  exito: string      = '';

  // Modal crear / editar
  mostrarModal: boolean    = false;
  modoEdicion: boolean     = false;
  tallerEditando: Taller | null = null;
  formulario: TallerRequest = { nombreTaller: '', descripcionTaller: '', cuposTaller: 0 };
  guardando: boolean = false;

  // Modal confirmar eliminación
  mostrarConfirmar: boolean  = false;
  tallerAEliminar: Taller | null = null;
  eliminando: boolean        = false;

  // Modal detalle (admin/docente)
  mostrarDetalle: boolean   = false;
  tallerDetalle: Taller | null = null;

  constructor(
    private authService: AuthService,
    private tallerService: TallerService,
    private router: Router
  ) {
    const role       = this.authService.getRole();
    this.nombre      = this.authService.getNombre();
    this.rol         = this.formatearRol(role);
    this.inicial     = this.nombre.charAt(0).toUpperCase();
    this.esEstudiante = role === 'ROLE_ESTUDIANTE';
    this.esAdmin     = ['ROLE_ADMIN', 'ROLE_DIRECTIVO', 'ROLE_DOCENTE'].includes(role);
    this.tituloPortal = this.esEstudiante ? 'Portal Estudiantil' : 'Panel Administrativo';
  }

  ngOnInit(): void {
    this.cargarTalleres();
  }

  cargarTalleres(): void {
    this.cargando = true;
    this.error    = '';
    this.tallerService.listar().subscribe({
      next: (data) => {
        this.talleres = data;
        this.cargando = false;
      },
      error: () => {
        this.error    = 'No se pudo conectar con el servidor. Verifica que el microservicio esté corriendo en el puerto 8085.';
        this.cargando = false;
      }
    });
  }

  inscribirse(taller: Taller): void {
    if (taller.cuposTaller <= 0) return;
    this.tallerService.inscribir(taller.idTaller).subscribe({
      next: (actualizado) => {
        const i = this.talleres.findIndex(t => t.idTaller === actualizado.idTaller);
        if (i !== -1) this.talleres[i] = actualizado;
        this.mostrarExito(`¡Te inscribiste en "${actualizado.nombreTaller}"! Cupos restantes: ${actualizado.cuposTaller}`);
      },
      error: (err) => {
        this.mostrarError(err.status === 409
          ? 'No hay cupos disponibles para este taller.'
          : 'Error al inscribirse. Intenta nuevamente.');
      }
    });
  }

  abrirNuevo(): void {
    this.modoEdicion   = false;
    this.tallerEditando = null;
    this.formulario    = { nombreTaller: '', descripcionTaller: '', cuposTaller: 0 };
    this.mostrarModal  = true;
  }

  abrirEdicion(taller: Taller): void {
    this.modoEdicion    = true;
    this.tallerEditando = taller;
    this.formulario     = {
      nombreTaller:      taller.nombreTaller,
      descripcionTaller: taller.descripcionTaller,
      cuposTaller:       taller.cuposTaller
    };
    this.mostrarModal = true;
  }

  guardar(): void {
    if (!this.formulario.nombreTaller.trim()) return;
    if (this.formulario.cuposTaller < 0)      return;

    this.guardando = true;

    if (this.modoEdicion && this.tallerEditando) {
      this.tallerService.actualizar(this.tallerEditando.idTaller, this.formulario).subscribe({
        next: (actualizado) => {
          const i = this.talleres.findIndex(t => t.idTaller === actualizado.idTaller);
          if (i !== -1) this.talleres[i] = actualizado;
          this.cerrarModal();
          this.mostrarExito('Taller actualizado correctamente.');
          this.guardando = false;
        },
        error: () => {
          this.mostrarError('Error al actualizar el taller.');
          this.guardando = false;
        }
      });
    } else {
      this.tallerService.crear(this.formulario).subscribe({
        next: (nuevo) => {
          this.talleres.push(nuevo);
          this.cerrarModal();
          this.mostrarExito('Taller creado correctamente.');
          this.guardando = false;
        },
        error: () => {
          this.mostrarError('Error al crear el taller.');
          this.guardando = false;
        }
      });
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  pedirConfirmacion(taller: Taller): void {
    this.tallerAEliminar  = taller;
    this.mostrarConfirmar = true;
  }

  confirmarEliminar(): void {
    if (!this.tallerAEliminar) return;
    this.eliminando = true;
    this.tallerService.eliminar(this.tallerAEliminar.idTaller).subscribe({
      next: () => {
        this.talleres     = this.talleres.filter(t => t.idTaller !== this.tallerAEliminar!.idTaller);
        this.eliminando   = false;
        this.cerrarConfirmar();
        this.mostrarExito('Taller eliminado correctamente.');
      },
      error: () => {
        this.mostrarError('Error al eliminar el taller.');
        this.eliminando = false;
      }
    });
  }

  cerrarConfirmar(): void {
    this.mostrarConfirmar = false;
    this.tallerAEliminar  = null;
  }

  verDetalle(taller: Taller): void {
    this.tallerDetalle  = taller;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.tallerDetalle  = null;
  }

  irAlHome(): void {
    this.router.navigate(['/home']);
  }

  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? '' : menu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private mostrarExito(msg: string): void {
    this.exito = msg;
    this.error = '';
    setTimeout(() => (this.exito = ''), 5000);
  }

  private mostrarError(msg: string): void {
    this.error = msg;
    this.exito = '';
    setTimeout(() => (this.error = ''), 5000);
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
