import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { GestionEstudiantesService, Estudiante } from '../../services/gestion-estudiantes.service';
import { UsuariosService, UsuarioResponse } from '../../services/usuarios.service';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.html',
  styleUrls: ['./gestion-estudiantes.scss']
})
export class GestionEstudiantesComponent implements OnInit {

  tab: 'estudiantes' | 'agregar-estudiante' | 'personal' | 'agregar-personal' | 'perfil' = 'estudiantes';

  nombre: string  = '';
  inicial: string = '';
  cargando = false;

  // Toast flotante
  toast: { msg: string; tipo: 'success' | 'error' } | null = null;
  private toastTimer: any;

  // ── Estudiantes ───────────────────────────────────────────────────────────
  estudiantes: Estudiante[]   = [];
  perfil:      Estudiante | null = null;
  editandoId:  number | null  = null;

  formEstudiante = {
    username:        '',
    password:        '',
    rut:             '',
    email:           '',
    nombre:          '',
    fechaNacimiento: '',
    numeroMatricula: '',
    carrera:         '',
    anioIngreso:     null as number | null,
  };

  // ── Personal (docentes y directivos) ──────────────────────────────────────
  personal: UsuarioResponse[] = [];
  cambioRolId:  number | null = null;
  cambioRolVal: string        = '';

  formPersonal = {
    username: '',
    rut:      '',
    email:    '',
    nombre:   '',
    password: '',
    rol:      'ROLE_DOCENTE' as 'ROLE_DOCENTE' | 'ROLE_DIRECTIVO',
    fechaNacimiento: '',
    carrera:         '',
    anioIngreso:     null as number | null,
  };

  readonly rolesPersonal = [
    { value: 'ROLE_DOCENTE',   label: 'Docente' },
    { value: 'ROLE_DIRECTIVO', label: 'Directivo' },
  ];

  readonly rolesLabel: Record<string, string> = {
    ROLE_ESTUDIANTE: 'Estudiante',
    ROLE_DOCENTE:    'Docente',
    ROLE_DIRECTIVO:  'Directivo',
  };

  private rol: string;

  constructor(
    private estudiantesService: GestionEstudiantesService,
    private usuariosService:    UsuariosService,
    private auth:               AuthService,
    private router:             Router
  ) {
    this.rol = this.auth.getRole();
  }

  ngOnInit(): void {
    this.nombre  = this.auth.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();

    if (this.esEstudiante()) {
      this.tab = 'perfil';
      this.estudiantesService.miPerfil().subscribe({
        next:  p  => this.perfil = p,
        error: err => this.mostrarToast(this.extractError(err), 'error')
      });
    } else {
      this.tab = 'estudiantes';
      this.cargarEstudiantes();
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

  // ── Helpers de rol ────────────────────────────────────────────────────────
  esEstudiante(): boolean { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDocente():    boolean { return this.rol === 'ROLE_DOCENTE'; }
  esDirectivo():  boolean { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }

  roleBadge(role: string): string {
    return { ROLE_DIRECTIVO: 'orange', ROLE_DOCENTE: 'blue', ROLE_ESTUDIANTE: 'gray' }[role] ?? 'gray';
  }

  // ── Estudiantes ───────────────────────────────────────────────────────────
  cargarEstudiantes(): void {
    this.estudiantesService.listar().subscribe({
      next:  data => this.estudiantes = data,
      error: err  => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  editarEstudiante(e: Estudiante): void {
    this.editandoId = e.id;
    this.formEstudiante = {
      username:        e.username,
      password:        '',
      rut:             e.rut             ?? '',
      email:           e.email,
      nombre:          e.nombre,
      fechaNacimiento: e.fechaNacimiento  ?? '',
      numeroMatricula: e.numeroMatricula  ?? '',
      carrera:         e.carrera          ?? '',
      anioIngreso:     e.anioIngreso,
    };
    this.tab = 'agregar-estudiante';
  }

  guardarEstudiante(): void {
    if (!this.formEstudiante.nombre.trim()) { this.mostrarToast('El nombre es obligatorio.', 'error'); return; }
    if (!this.editandoId && !this.formEstudiante.username.trim()) { this.mostrarToast('El username es obligatorio.', 'error'); return; }
    if (!this.editandoId && this.formEstudiante.password.length < 8) { this.mostrarToast('La contraseña debe tener al menos 8 caracteres.', 'error'); return; }
    if (!this.formEstudiante.email.trim()) { this.mostrarToast('El email es obligatorio.', 'error'); return; }

    this.cargando = true;

    const payload: any = {
      email:           this.formEstudiante.email,
      nombre:          this.formEstudiante.nombre,
      rut:             this.formEstudiante.rut             || null,
      fechaNacimiento: this.formEstudiante.fechaNacimiento || null,
      numeroMatricula: this.formEstudiante.numeroMatricula || null,
      carrera:         this.formEstudiante.carrera         || null,
      anioIngreso:     this.formEstudiante.anioIngreso     || null,
    };
    if (!this.editandoId) {
      payload['username'] = this.formEstudiante.username;
      payload['password'] = this.formEstudiante.password;
    }

    const obs = this.editandoId
      ? this.estudiantesService.actualizar(this.editandoId, payload)
      : this.estudiantesService.crear(payload);

    obs.subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarToast(
          this.editandoId ? '✓ Estudiante actualizado correctamente.' : '✓ Estudiante creado correctamente.',
          'success'
        );
        this.resetFormEstudiante();
        this.tab = 'estudiantes';
        this.cargarEstudiantes();
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarToast(this.extractError(err), 'error');
      }
    });
  }

  desactivarEstudiante(id: number): void {
    if (!confirm('¿Desactivar este estudiante?')) return;
    this.estudiantesService.desactivar(id).subscribe({
      next:  () => { this.mostrarToast('Estudiante desactivado.', 'success'); this.cargarEstudiantes(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  // ── Personal (docentes y directivos) ──────────────────────────────────────
  cargarPersonal(): void {
    this.usuariosService.listar().subscribe({
      next:  data => this.personal = data.filter(u =>
        u.role === 'ROLE_DOCENTE' || u.role === 'ROLE_DIRECTIVO'),
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  guardarPersonal(): void {
    if (!this.formPersonal.nombre.trim())    { this.mostrarToast('El nombre es obligatorio.', 'error'); return; }
    if (!this.formPersonal.username.trim())  { this.mostrarToast('El username es obligatorio.', 'error'); return; }
    if (!this.formPersonal.email.trim())     { this.mostrarToast('El email es obligatorio.', 'error'); return; }
    if (this.formPersonal.password.length < 8) { this.mostrarToast('La contraseña debe tener al menos 8 caracteres.', 'error'); return; }

    this.cargando = true;
    this.usuariosService.crear({
      username: this.formPersonal.username,
      email:    this.formPersonal.email,
      nombre:   this.formPersonal.nombre,
      password: this.formPersonal.password,
      role:     this.formPersonal.rol,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarToast(`✓ ${this.rolesLabel[this.formPersonal.rol]} "${this.formPersonal.nombre}" creado correctamente.`, 'success');
        this.resetFormPersonal();
        this.tab = 'personal';
        this.cargarPersonal();
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarToast(this.extractError(err), 'error');
      }
    });
  }

  iniciarCambioRol(u: UsuarioResponse): void {
    this.cambioRolId  = u.id;
    this.cambioRolVal = u.role;
  }

  confirmarCambioRol(): void {
    if (this.cambioRolId === null) return;
    this.usuariosService.cambiarRol(this.cambioRolId, this.cambioRolVal).subscribe({
      next: () => { this.mostrarToast('Rol actualizado correctamente.', 'success'); this.cambioRolId = null; this.cargarPersonal(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  toggleEstadoPersonal(u: UsuarioResponse): void {
    if (!confirm(`¿${u.enabled ? 'Desactivar' : 'Activar'} a "${u.nombre}"?`)) return;
    this.usuariosService.cambiarEstado(u.id, !u.enabled).subscribe({
      next:  () => { this.mostrarToast(`Usuario ${u.enabled ? 'desactivado' : 'activado'}.`, 'success'); this.cargarPersonal(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  irAPersonal(): void {
    this.tab = 'personal';
    this.cargarPersonal();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  volver(): void { this.router.navigate(['/home']); }

  private resetFormEstudiante(): void {
    this.editandoId     = null;
    this.formEstudiante = {
      username: '', password: '', rut: '', email: '', nombre: '',
      fechaNacimiento: '', numeroMatricula: '', carrera: '', anioIngreso: null
    };
  }

  private resetFormPersonal(): void {
    this.formPersonal = {
      username: '', rut: '', email: '', nombre: '', password: '',
      rol: 'ROLE_DOCENTE', fechaNacimiento: '', carrera: '', anioIngreso: null
    };
  }
}
