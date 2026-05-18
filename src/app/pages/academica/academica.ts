import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AcademicaService,
  Asignatura,
  Seccion,
  Inscripcion,
} from '../../services/academica.service';
import { AuthService } from '../../services/auth';
import { UsuariosService, UsuarioResponse } from '../../services/usuarios.service';
import { GestionEstudiantesService, Estudiante } from '../../services/gestion-estudiantes.service';

@Component({
  selector: 'app-academica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academica.html',
  styleUrls: ['./academica.scss']
})
export class AcademicaComponent implements OnInit {

  tab: 'asignaturas' | 'secciones' | 'inscripciones' = 'asignaturas';

  nombre: string = '';
  inicial: string = '';

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: { msg: string; tipo: 'success' | 'error' } | null = null;
  private toastTimer: any;

  mostrarToast(msg: string, tipo: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { msg, tipo };
    this.toastTimer = setTimeout(() => this.toast = null, 4000);
  }

  extractError(err: any): string {
    return err?.error?.message
        || err?.error?.error
        || err?.message
        || (err?.name === 'TimeoutError' ? 'El servidor no respondió.' : null)
        || 'Ocurrió un error inesperado.';
  }

  // ── Asignaturas ────────────────────────────────────────────────────────────
  asignaturas: Asignatura[] = [];
  formAsig = { codigo: '', nombre: '', descripcion: '', creditos: 3 };
  editandoAsig: Asignatura | null = null;
  cargandoAsig = false;

  // ── Secciones ──────────────────────────────────────────────────────────────
  secciones: Seccion[] = [];
  formSeccion = { asignaturaId: 0, periodo: '', cupoMaximo: 30, docenteUsername: '' };
  editandoSeccion: Seccion | null = null;
  cargandoSeccion = false;

  // Horarios expandibles
  seccionSeleccionada: Seccion | null = null;
  formHorario = { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '09:30', sala: '' };
  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  // ── Inscripciones ──────────────────────────────────────────────────────────
  seccionParaInscritos: Seccion | null = null;
  inscritos: Inscripcion[] = [];
  nuevoEstudiante: string = '';

  // ── Listas desde la DB ─────────────────────────────────────────────────────
  /** Docentes y directivos disponibles para asignar a secciones */
  docentes: UsuarioResponse[] = [];
  /** Todos los estudiantes activos del sistema */
  estudiantes: Estudiante[] = [];

  constructor(
    private service: AcademicaService,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private estudiantesService: GestionEstudiantesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombre  = this.authService.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();
    this.cargarAsignaturas();
    this.cargarSecciones();
    this.cargarDocentes();
    this.cargarEstudiantes();
  }

  volver(): void { this.router.navigate(['/home']); }

  // ── Cargar listas ──────────────────────────────────────────────────────────

  cargarDocentes(): void {
    this.usuariosService.listar().subscribe({
      next: data => this.docentes = data.filter(u =>
        (u.role === 'ROLE_DOCENTE' || u.role === 'ROLE_DIRECTIVO') && u.enabled),
      error: err => this.mostrarToast('No se pudo cargar la lista de docentes: ' + this.extractError(err), 'error')
    });
  }

  cargarEstudiantes(): void {
    this.estudiantesService.listar().subscribe({
      next: data => this.estudiantes = data.filter(e => e.activo),
      error: err => this.mostrarToast('No se pudo cargar la lista de estudiantes: ' + this.extractError(err), 'error')
    });
  }

  /** Estudiantes que aún NO están inscritos en la sección actual */
  get estudiantesDisponibles(): Estudiante[] {
    const inscritos = new Set(this.inscritos.map(i => i.estudianteUsername));
    return this.estudiantes.filter(e => !inscritos.has(e.username));
  }

  // ── Asignaturas ────────────────────────────────────────────────────────────

  cargarAsignaturas(): void {
    this.service.getAsignaturas().subscribe({
      next:  data => this.asignaturas = data,
      error: err  => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  guardarAsignatura(): void {
    if (!this.formAsig.codigo.trim()) { this.mostrarToast('El código es obligatorio.', 'error'); return; }
    if (!this.formAsig.nombre.trim()) { this.mostrarToast('El nombre es obligatorio.', 'error'); return; }

    this.cargandoAsig = true;

    const obs = this.editandoAsig
      ? this.service.actualizarAsignatura(this.editandoAsig.id, this.formAsig)
      : this.service.crearAsignatura(this.formAsig);

    obs.subscribe({
      next: () => {
        this.mostrarToast(
          this.editandoAsig ? '✓ Asignatura actualizada.' : '✓ Asignatura creada correctamente.',
          'success'
        );
        this.cargarAsignaturas();
        this.resetFormAsig();
      },
      error: err => {
        this.cargandoAsig = false;
        this.mostrarToast(this.extractError(err), 'error');
      }
    });
  }

  editarAsignatura(a: Asignatura): void {
    this.editandoAsig = a;
    this.formAsig = { codigo: a.codigo, nombre: a.nombre, descripcion: a.descripcion ?? '', creditos: a.creditos };
  }

  eliminarAsignatura(id: number): void {
    if (!confirm('¿Desactivar esta asignatura?')) return;
    this.service.eliminarAsignatura(id).subscribe({
      next:  () => { this.mostrarToast('Asignatura desactivada.', 'success'); this.cargarAsignaturas(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  resetFormAsig(): void {
    this.formAsig = { codigo: '', nombre: '', descripcion: '', creditos: 3 };
    this.editandoAsig = null;
    this.cargandoAsig = false;
  }

  // ── Secciones ──────────────────────────────────────────────────────────────

  cargarSecciones(): void {
    this.service.getSecciones().subscribe({
      next:  data => this.secciones = data,
      error: err  => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  guardarSeccion(): void {
    if (!this.formSeccion.asignaturaId) { this.mostrarToast('Selecciona una asignatura.', 'error'); return; }
    if (!this.formSeccion.periodo.trim()) { this.mostrarToast('El período es obligatorio.', 'error'); return; }
    if (!this.formSeccion.docenteUsername) { this.mostrarToast('Selecciona un docente.', 'error'); return; }

    this.cargandoSeccion = true;

    const obs = this.editandoSeccion
      ? this.service.actualizarSeccion(this.editandoSeccion.id, this.formSeccion)
      : this.service.crearSeccion(this.formSeccion);

    obs.subscribe({
      next: () => {
        this.mostrarToast(
          this.editandoSeccion ? '✓ Sección actualizada.' : '✓ Sección creada correctamente.',
          'success'
        );
        this.cargarSecciones();
        this.resetFormSeccion();
      },
      error: err => {
        this.cargandoSeccion = false;
        this.mostrarToast(this.extractError(err), 'error');
      }
    });
  }

  editarSeccion(s: Seccion): void {
    this.editandoSeccion = s;
    this.formSeccion = {
      asignaturaId:    s.asignaturaId,
      periodo:         s.periodo,
      cupoMaximo:      s.cupoMaximo,
      docenteUsername: s.docenteUsername ?? ''
    };
  }

  eliminarSeccion(id: number): void {
    if (!confirm('¿Desactivar esta sección?')) return;
    this.service.eliminarSeccion(id).subscribe({
      next:  () => { this.mostrarToast('Sección desactivada.', 'success'); this.cargarSecciones(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  resetFormSeccion(): void {
    this.formSeccion = { asignaturaId: 0, periodo: '', cupoMaximo: 30, docenteUsername: '' };
    this.editandoSeccion = null;
    this.cargandoSeccion = false;
    this.seccionSeleccionada = null;
  }

  // ── Horarios ───────────────────────────────────────────────────────────────

  verHorarios(s: Seccion): void {
    this.seccionSeleccionada = this.seccionSeleccionada?.id === s.id ? null : s;
  }

  agregarHorario(seccionId: number): void {
    if (!this.formHorario.horaInicio || !this.formHorario.horaFin) {
      this.mostrarToast('Completa hora inicio y hora fin.', 'error'); return;
    }
    this.service.agregarHorario(seccionId, this.formHorario).subscribe({
      next: () => {
        this.mostrarToast('✓ Horario agregado.', 'success');
        this.cargarSecciones();
        this.formHorario = { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '09:30', sala: '' };
      },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  eliminarHorario(seccionId: number, horarioId: number): void {
    this.service.eliminarHorario(seccionId, horarioId).subscribe({
      next:  () => { this.mostrarToast('Horario eliminado.', 'success'); this.cargarSecciones(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────

  verInscritos(s: Seccion): void {
    this.seccionParaInscritos = s;
    this.nuevoEstudiante = '';
    this.tab = 'inscripciones';
    this.service.getInscritos(s.id).subscribe({
      next:  data => this.inscritos = data,
      error: err  => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  inscribir(): void {
    if (!this.nuevoEstudiante || !this.seccionParaInscritos) {
      this.mostrarToast('Selecciona un estudiante.', 'error'); return;
    }
    this.service.inscribir(this.seccionParaInscritos.id, this.nuevoEstudiante).subscribe({
      next: () => {
        this.mostrarToast('✓ Estudiante inscrito correctamente.', 'success');
        this.nuevoEstudiante = '';
        this.verInscritos(this.seccionParaInscritos!);
      },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  eliminarInscripcion(inscripcionId: number): void {
    if (!this.seccionParaInscritos) return;
    this.service.eliminarInscripcion(this.seccionParaInscritos.id, inscripcionId).subscribe({
      next:  () => { this.mostrarToast('Estudiante retirado.', 'success'); this.verInscritos(this.seccionParaInscritos!); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }
}
