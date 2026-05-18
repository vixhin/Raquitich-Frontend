import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ObservacionesService, Observacion, ObservacionRequest } from '../../services/observaciones.service';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.html',
  styleUrls: ['./observaciones.scss']
})
export class ObservacionesComponent implements OnInit {

  observaciones: Observacion[] = [];
  mostrarForm = false;
  mensajeExito = '';
  mensajeError  = '';

  form: ObservacionRequest = {
    estudianteUsername: '',
    tipo:               'ACADEMICA',
    titulo:             '',
    contenido:          '',
    fechaObservacion:   ''
  };

  tipos = ['ACADEMICA', 'CONDUCTUAL', 'POSITIVA', 'SEGUIMIENTO', 'GENERAL'];

  private rol: string;

  constructor(
    private service: ObservacionesService,
    private auth: AuthService,
    private router: Router
  ) {
    this.rol = this.auth.getRole();
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.esEstudiante()) {
      this.service.misObservaciones().subscribe({
        next: data => this.observaciones = data,
        error: () => this.mensajeError = 'No se pudieron cargar tus observaciones.'
      });
    } else {
      this.service.listarTodas().subscribe({
        next: data => this.observaciones = data,
        error: () => this.mensajeError = 'Error al cargar las observaciones.'
      });
    }
  }

  esEstudiante(): boolean { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDocente():    boolean { return this.rol === 'ROLE_DOCENTE'; }
  esDirectivo():  boolean { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }
  puedeCrear():   boolean { return this.esDocente() || this.esDirectivo(); }

  abrirForm(): void {
    this.resetForm();
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.resetForm();
  }

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError  = '';

    const payload: ObservacionRequest = {
      estudianteUsername: this.form.estudianteUsername,
      tipo:               this.form.tipo,
      titulo:             this.form.titulo,
      contenido:          this.form.contenido,
      fechaObservacion:   this.form.fechaObservacion || undefined
    };

    this.service.registrar(payload).subscribe({
      next: () => {
        this.mensajeExito = 'Observación registrada correctamente.';
        this.cerrarForm();
        this.cargar();
      },
      error: () => this.mensajeError = 'Error al registrar la observación.'
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar esta observación?')) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Observación eliminada.';
        this.cargar();
      },
      error: () => this.mensajeError = 'Error al eliminar.'
    });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  badgeClass(tipo: string): string {
    const map: Record<string, string> = {
      ACADEMICA:   'badge-blue',
      CONDUCTUAL:  'badge-red',
      POSITIVA:    'badge-green',
      SEGUIMIENTO: 'badge-orange',
      GENERAL:     'badge-gray'
    };
    return map[tipo] ?? 'badge-gray';
  }

  private resetForm(): void {
    this.form = {
      estudianteUsername: '',
      tipo:               'ACADEMICA',
      titulo:             '',
      contenido:          '',
      fechaObservacion:   ''
    };
  }
}
