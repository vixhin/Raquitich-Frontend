import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ObservacionesService, Observacion, ObservacionRequest } from '../../services/observaciones.service';
import { GestionEstudiantesService, Estudiante } from '../../services/gestion-estudiantes.service';

@Component({
  selector: 'app-observaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones.html',
  styleUrls: ['./observaciones.scss']
})
export class ObservacionesComponent implements OnInit {

  tab: 'lista' | 'nueva' = 'lista';

  nombre: string = '';
  inicial: string = '';
  observaciones: Observacion[] = [];
  cargando = false;

  // Toast flotante
  toast: { msg: string; tipo: 'success' | 'error' } | null = null;
  private toastTimer: any;

  form: ObservacionRequest = {
    estudianteUsername: '',
    tipo:               'ACADEMICA',
    titulo:             '',
    contenido:          '',
    fechaObservacion:   ''
  };

  tipos = ['ACADEMICA', 'CONDUCTUAL', 'POSITIVA', 'SEGUIMIENTO', 'GENERAL'];

  // Dropdown de estudiantes con búsqueda
  estudiantes: Estudiante[] = [];
  busquedaEstudiante = '';
  mostrarDropdownEstudiante = false;

  get estudiantesFiltrados(): Estudiante[] {
    const q = this.busquedaEstudiante.toLowerCase();
    return this.estudiantes.filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.username.toLowerCase().includes(q) ||
      (e.rut ?? '').toLowerCase().includes(q)
    );
  }

  seleccionarEstudiante(e: Estudiante): void {
    this.form.estudianteUsername = e.username;
    this.busquedaEstudiante = `${e.nombre} (${e.username})`;
    this.mostrarDropdownEstudiante = false;
  }

  private rol: string;

  constructor(
    private service: ObservacionesService,
    private estudiantesService: GestionEstudiantesService,
    private auth: AuthService,
    private router: Router
  ) {
    this.rol = this.auth.getRole();
  }

  ngOnInit(): void {
    this.nombre  = this.auth.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();
    this.cargar();
    if (this.puedeCrear()) {
      this.estudiantesService.listar().subscribe({
        next:  data => this.estudiantes = data.filter(e => e.activo),
        error: ()   => {}
      });
    }
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  mostrarToast(msg: string, tipo: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { msg, tipo };
    this.toastTimer = setTimeout(() => this.toast = null, 4000);
  }

  extractError(err: any): string {
    return err?.error?.message
        || err?.error?.error
        || err?.message
        || (err?.name === 'TimeoutError' ? 'El servidor no respondió. Verifica que los servicios estén activos.' : null)
        || 'Ocurrió un error inesperado.';
  }

  cargar(): void {
    const obs$ = this.esEstudiante()
      ? this.service.misObservaciones()
      : this.service.listarTodas();

    obs$.subscribe({
      next:  data => this.observaciones = data,
      error: err  => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  esEstudiante(): boolean { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDocente():    boolean { return this.rol === 'ROLE_DOCENTE'; }
  esDirectivo():  boolean { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }
  puedeCrear():   boolean { return this.esDocente() || this.esDirectivo(); }

  guardar(): void {
    if (!this.form.estudianteUsername.trim()) { this.mostrarToast('Selecciona un estudiante.', 'error'); return; }
    if (!this.form.titulo.trim())             { this.mostrarToast('El título es obligatorio.', 'error'); return; }
    if (!this.form.contenido.trim())          { this.mostrarToast('El contenido es obligatorio.', 'error'); return; }

    this.cargando = true;

    this.service.registrar({
      ...this.form,
      fechaObservacion: this.form.fechaObservacion || undefined
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarToast('✓ Observación registrada correctamente.', 'success');
        this.resetForm();
        this.tab = 'lista';
        this.cargar();
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarToast(this.extractError(err), 'error');
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar esta observación? Esta acción no se puede deshacer.')) return;
    this.service.eliminar(id).subscribe({
      next:  () => { this.mostrarToast('Observación eliminada.', 'success'); this.cargar(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  badgeClass(tipo: string): string {
    const map: Record<string, string> = {
      ACADEMICA:   'blue',
      CONDUCTUAL:  'red',
      POSITIVA:    'green',
      SEGUIMIENTO: 'orange',
      GENERAL:     'gray'
    };
    return map[tipo] ?? 'gray';
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  private resetForm(): void {
    this.form = {
      estudianteUsername: '',
      tipo:               'ACADEMICA',
      titulo:             '',
      contenido:          '',
      fechaObservacion:   ''
    };
    this.busquedaEstudiante = '';
    this.mostrarDropdownEstudiante = false;
  }
}
