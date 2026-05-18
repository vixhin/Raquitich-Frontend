import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarioService, Evento, EventoRequest } from '../../services/calendario.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss']
})
export class CalendarioComponent implements OnInit {

  nombre  = '';
  inicial = '';
  esDirectivo = false;
  esEstudiante = false;
  username = '';

  tab: 'lista' | 'crear' = 'lista';
  esDocente = false;

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: { msg: string; tipo: 'success' | 'error' } | null = null;
  private toastTimer: any;

  mostrarToast(msg: string, tipo: 'success' | 'error') {
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

  // ── Datos ──────────────────────────────────────────────────────────────────
  eventos: Evento[] = [];
  cargando = false;
  editando: Evento | null = null;

  form: EventoRequest & { tipoEvento: 'institucional' | 'publico' | 'personal' } = {
    tipoEvento:  'personal',
    titulo:      '',
    descripcion: '',
    fechaInicio: '',
    fechaFin:    '',
    horaInicio:  '',
    horaFin:     '',
    color:       '#4f46e5'
  };

  colores = [
    { label: 'Indigo',  value: '#4f46e5' },
    { label: 'Rojo',    value: '#ef4444' },
    { label: 'Verde',   value: '#16a34a' },
    { label: 'Naranja', value: '#ea580c' },
    { label: 'Azul',    value: '#3b82f6' },
    { label: 'Morado',  value: '#9333ea' },
  ];

  constructor(
    private service: CalendarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombre      = this.authService.getNombre();
    this.inicial     = this.nombre.charAt(0).toUpperCase();
    this.username    = this.authService.getUsername();
    const role       = this.authService.getRole();
    this.esDirectivo  = role === 'ROLE_DIRECTIVO' || role === 'ROLE_ADMIN';
    this.esEstudiante = role === 'ROLE_ESTUDIANTE';
    this.esDocente    = role === 'ROLE_DOCENTE';

    if (this.esDirectivo) this.form.tipoEvento = 'institucional';
    else if (this.esDocente) this.form.tipoEvento = 'personal';
    this.cargar();
  }

  volver() { this.router.navigate(['/home']); }

  cargar(): void {
    this.cargando = true;
    this.service.getEventos().subscribe({
      next:  data => { this.eventos = data; this.cargando = false; },
      error: err  => { this.cargando = false; this.mostrarToast(this.extractError(err), 'error'); }
    });
  }

  // ── Getters de listas filtradas ─────────────────────────────────────────────
  get eventosInstitucionales(): Evento[] {
    return this.eventos.filter(e => e.tipo === 'INSTITUCIONAL');
  }

  get eventosPersonales(): Evento[] {
    return this.eventos.filter(e => e.tipo === 'PERSONAL' && e.creadoPor === this.username);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  guardar(): void {
    if (!this.form.titulo.trim()) { this.mostrarToast('El título es obligatorio.', 'error'); return; }
    if (!this.form.fechaInicio)   { this.mostrarToast('La fecha de inicio es obligatoria.', 'error'); return; }

    if (this.editando) {
      this.service.actualizar(this.editando.id, this.form).subscribe({
        next: () => { this.mostrarToast('✓ Evento actualizado.', 'success'); this.resetForm(); this.cargar(); },
        error: err => this.mostrarToast(this.extractError(err), 'error')
      });
      return;
    }

    const obs = this.form.tipoEvento === 'institucional'
      ? this.service.crearInstitucional(this.form)
      : this.form.tipoEvento === 'publico'
        ? this.service.crearPublico(this.form)
        : this.service.crearPersonal(this.form);

    obs.subscribe({
      next: () => { this.mostrarToast('✓ Evento creado.', 'success'); this.resetForm(); this.cargar(); tab: 'lista' },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  editar(e: Evento): void {
    this.editando = e;
    this.form = {
      tipoEvento:  e.tipo === 'INSTITUCIONAL' ? 'institucional' : 'personal',
      titulo:      e.titulo,
      descripcion: e.descripcion || '',
      fechaInicio: e.fechaInicio || '',
      fechaFin:    e.fechaFin    || '',
      horaInicio:  e.horaInicio  || '',
      horaFin:     e.horaFin     || '',
      color:       e.color       || '#4f46e5'
    };
    this.tab = 'crear';
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este evento?')) return;
    this.service.eliminar(id).subscribe({
      next:  () => { this.mostrarToast('Evento eliminado.', 'success'); this.cargar(); },
      error: err => this.mostrarToast(this.extractError(err), 'error')
    });
  }

  puedeEditar(e: Evento): boolean {
    return this.esDirectivo || e.creadoPor === this.username;
  }

  resetForm(): void {
    this.editando = null;
    this.form = {
      tipoEvento:  this.esDirectivo ? 'institucional' : this.esDocente ? 'personal' : 'personal',
      titulo: '', descripcion: '', fechaInicio: '',
      fechaFin: '', horaInicio: '', horaFin: '', color: '#4f46e5'
    };
    this.tab = 'lista';
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`;
  }
}
