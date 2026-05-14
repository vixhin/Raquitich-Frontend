import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AcademicaService,
  Asignatura,
  Seccion,
  Inscripcion,
  HorarioResponse
} from '../../services/academica.service';
import { AuthService } from '../../services/auth';

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

  // ── Asignaturas ────────────────────────────────────────────────────────────
  asignaturas: Asignatura[] = [];
  formAsig = { codigo: '', nombre: '', descripcion: '', creditos: 3 };
  editandoAsig: Asignatura | null = null;
  errorAsig: string = '';
  cargandoAsig = false;

  // ── Secciones ──────────────────────────────────────────────────────────────
  secciones: Seccion[] = [];
  formSeccion = { asignaturaId: 0, periodo: '', cupoMaximo: 30, docenteUsername: '' };
  editandoSeccion: Seccion | null = null;
  errorSeccion: string = '';
  cargandoSeccion = false;

  // Horarios dentro de una sección
  seccionSeleccionada: Seccion | null = null;
  formHorario = { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '09:30', sala: '' };
  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  // ── Inscripciones ──────────────────────────────────────────────────────────
  seccionParaInscritos: Seccion | null = null;
  inscritos: Inscripcion[] = [];
  nuevoEstudiante: string = '';
  errorInscripcion: string = '';

  constructor(
    private service: AcademicaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombre  = this.authService.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();
    this.cargarAsignaturas();
    this.cargarSecciones();
  }

  volver() {
    this.router.navigate(['/home']);
  }

  // ── Asignaturas ────────────────────────────────────────────────────────────

  cargarAsignaturas() {
    this.service.getAsignaturas().subscribe({
      next: data => this.asignaturas = data,
      error: () => this.errorAsig = 'Error al cargar asignaturas'
    });
  }

  guardarAsignatura() {
    this.errorAsig = '';
    this.cargandoAsig = true;

    if (this.editandoAsig) {
      this.service.actualizarAsignatura(this.editandoAsig.id, this.formAsig).subscribe({
        next: () => { this.cargarAsignaturas(); this.resetFormAsig(); },
        error: err => { this.errorAsig = err.error?.error ?? 'Error al actualizar'; this.cargandoAsig = false; }
      });
    } else {
      this.service.crearAsignatura(this.formAsig).subscribe({
        next: () => { this.cargarAsignaturas(); this.resetFormAsig(); },
        error: err => { this.errorAsig = err.error?.error ?? 'Error al crear'; this.cargandoAsig = false; }
      });
    }
  }

  editarAsignatura(a: Asignatura) {
    this.editandoAsig = a;
    this.formAsig = { codigo: a.codigo, nombre: a.nombre, descripcion: a.descripcion ?? '', creditos: a.creditos };
  }

  eliminarAsignatura(id: number) {
    if (!confirm('¿Desactivar esta asignatura?')) return;
    this.service.eliminarAsignatura(id).subscribe({
      next: () => this.cargarAsignaturas(),
      error: () => this.errorAsig = 'Error al eliminar'
    });
  }

  resetFormAsig() {
    this.formAsig = { codigo: '', nombre: '', descripcion: '', creditos: 3 };
    this.editandoAsig = null;
    this.cargandoAsig = false;
  }

  // ── Secciones ──────────────────────────────────────────────────────────────

  cargarSecciones() {
    this.service.getSecciones().subscribe({
      next: data => this.secciones = data,
      error: () => this.errorSeccion = 'Error al cargar secciones'
    });
  }

  guardarSeccion() {
    this.errorSeccion = '';
    this.cargandoSeccion = true;

    if (this.editandoSeccion) {
      this.service.actualizarSeccion(this.editandoSeccion.id, this.formSeccion).subscribe({
        next: () => { this.cargarSecciones(); this.resetFormSeccion(); },
        error: err => { this.errorSeccion = err.error?.error ?? 'Error al actualizar'; this.cargandoSeccion = false; }
      });
    } else {
      this.service.crearSeccion(this.formSeccion).subscribe({
        next: () => { this.cargarSecciones(); this.resetFormSeccion(); },
        error: err => { this.errorSeccion = err.error?.error ?? 'Error al crear'; this.cargandoSeccion = false; }
      });
    }
  }

  editarSeccion(s: Seccion) {
    this.editandoSeccion = s;
    this.formSeccion = {
      asignaturaId:    s.asignaturaId,
      periodo:         s.periodo,
      cupoMaximo:      s.cupoMaximo,
      docenteUsername: s.docenteUsername ?? ''
    };
  }

  eliminarSeccion(id: number) {
    if (!confirm('¿Desactivar esta sección?')) return;
    this.service.eliminarSeccion(id).subscribe({
      next: () => this.cargarSecciones(),
      error: () => this.errorSeccion = 'Error al eliminar'
    });
  }

  resetFormSeccion() {
    this.formSeccion = { asignaturaId: 0, periodo: '', cupoMaximo: 30, docenteUsername: '' };
    this.editandoSeccion = null;
    this.cargandoSeccion = false;
    this.seccionSeleccionada = null;
  }

  // Horarios
  verHorarios(s: Seccion) {
    this.seccionSeleccionada = this.seccionSeleccionada?.id === s.id ? null : s;
  }

  agregarHorario(seccionId: number) {
    this.service.agregarHorario(seccionId, this.formHorario).subscribe({
      next: () => { this.cargarSecciones(); this.formHorario = { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '09:30', sala: '' }; },
      error: err => this.errorSeccion = err.error?.error ?? 'Error al agregar horario'
    });
  }

  eliminarHorario(seccionId: number, horarioId: number) {
    this.service.eliminarHorario(seccionId, horarioId).subscribe({
      next: () => this.cargarSecciones(),
      error: () => this.errorSeccion = 'Error al eliminar horario'
    });
  }

  // ── Inscripciones ──────────────────────────────────────────────────────────

  verInscritos(s: Seccion) {
    this.seccionParaInscritos = s;
    this.errorInscripcion = '';
    this.tab = 'inscripciones';
    this.service.getInscritos(s.id).subscribe({
      next: data => this.inscritos = data,
      error: () => this.errorInscripcion = 'Error al cargar inscritos'
    });
  }

  inscribir() {
    if (!this.nuevoEstudiante.trim() || !this.seccionParaInscritos) return;
    this.service.inscribir(this.seccionParaInscritos.id, this.nuevoEstudiante.trim()).subscribe({
      next: () => {
        this.nuevoEstudiante = '';
        this.verInscritos(this.seccionParaInscritos!);
      },
      error: err => this.errorInscripcion = err.error?.error ?? 'Error al inscribir'
    });
  }

  eliminarInscripcion(inscripcionId: number) {
    if (!this.seccionParaInscritos) return;
    this.service.eliminarInscripcion(this.seccionParaInscritos.id, inscripcionId).subscribe({
      next: () => this.verInscritos(this.seccionParaInscritos!),
      error: () => this.errorInscripcion = 'Error al eliminar'
    });
  }

  getNombreAsignatura(id: number): string {
    return this.asignaturas.find(a => a.id === id)?.nombre ?? '—';
  }
}
