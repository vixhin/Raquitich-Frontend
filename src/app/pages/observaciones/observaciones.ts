import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ObservacionesService, Observacion } from '../../services/observaciones.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.html',
  styleUrls: ['./observaciones.scss']
})
export class ObservacionesComponent implements OnInit {

  rol: string = '';
  nombre: string = '';
  inicial: string = '';

  observaciones: Observacion[] = [];
  error: string = '';
  cargando = false;

  // Formulario nueva observación (solo docente/directivo)
  mostrarForm = false;
  form = {
    estudianteUsername: '',
    tipo: 'GENERAL',
    titulo: '',
    contenido: '',
    fechaObservacion: ''
  };
  tipos = ['ACADEMICA', 'CONDUCTUAL', 'POSITIVA', 'SEGUIMIENTO', 'GENERAL'];
  errorForm = '';
  guardando = false;

  constructor(
    private service: ObservacionesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rol    = this.authService.getRole();
    this.nombre = this.authService.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.error = '';

    const obs$ = this.esEstudiante()
      ? this.service.misObservaciones()
      : this.service.listarTodas();

    obs$.subscribe({
      next: data => { this.observaciones = data; this.cargando = false; },
      error: () => { this.error = 'Error al cargar observaciones'; this.cargando = false; }
    });
  }

  guardar() {
    this.errorForm = '';
    this.guardando = true;
    this.service.registrar(this.form).subscribe({
      next: () => {
        this.resetForm();
        this.cargar();
      },
      error: err => {
        this.errorForm = err.error?.error ?? 'Error al guardar';
        this.guardando = false;
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar esta observación?')) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error = 'Error al eliminar'
    });
  }

  resetForm() {
    this.form = { estudianteUsername: '', tipo: 'GENERAL', titulo: '', contenido: '', fechaObservacion: '' };
    this.mostrarForm = false;
    this.guardando = false;
  }

  esEstudiante() { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDirectivo()  { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }

  volver() { this.router.navigate(['/home']); }

  colorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      ACADEMICA:   'blue',
      CONDUCTUAL:  'red',
      POSITIVA:    'green',
      SEGUIMIENTO: 'orange',
      GENERAL:     'gray'
    };
    return colores[tipo] ?? 'gray';
  }
}
