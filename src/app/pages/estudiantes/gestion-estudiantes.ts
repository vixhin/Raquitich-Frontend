import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GestionEstudiantesService, Estudiante } from '../../services/gestion-estudiantes.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.html',
  styleUrls: ['./gestion-estudiantes.scss']
})
export class GestionEstudiantesComponent implements OnInit {

  rol = '';
  nombre = '';
  inicial = '';

  estudiantes: Estudiante[] = [];
  cargando = false;
  error = '';

  miPerfil: Estudiante | null = null;
  cargandoPerfil = false;

  textoBusqueda = '';

  mostrarForm = false;
  modoEditar = false;
  guardando = false;
  errorForm = '';
  mensajeExito = '';
  idEditando: number | null = null;

  form = {
    username: '',
    email: '',
    password: '',
    nombre: '',
    fechaNacimiento: '',
    numeroMatricula: '',
    carrera: '',
    anioIngreso: null as number | null
  };

  constructor(
    private service: GestionEstudiantesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rol     = this.authService.getRole();
    this.nombre  = this.authService.getNombre();
    this.inicial = this.nombre.charAt(0).toUpperCase();
    this.esEstudiante() ? this.cargarMiPerfil() : this.cargarLista();
  }

  cargarLista(): void {
    this.cargando = true;
    this.error = '';
    this.service.listar().subscribe({
      next: (data) => { this.estudiantes = data; this.cargando = false; },
      error: () => { this.error = 'Error al cargar estudiantes'; this.cargando = false; }
    });
  }

  cargarMiPerfil(): void {
    this.cargandoPerfil = true;
    this.service.miPerfil().subscribe({
      next: (data) => { this.miPerfil = data; this.cargandoPerfil = false; },
      error: () => { this.error = 'Error al cargar tu perfil'; this.cargandoPerfil = false; }
    });
  }

  get estudiantesFiltrados(): Estudiante[] {
    if (!this.textoBusqueda.trim()) return this.estudiantes;
    const txt = this.textoBusqueda.toLowerCase();
    return this.estudiantes.filter(e =>
      e.nombre.toLowerCase().includes(txt) ||
      e.username.toLowerCase().includes(txt) ||
      (e.numeroMatricula != null && e.numeroMatricula.toLowerCase().includes(txt))
    );
  }

  guardar(): void {
    this.errorForm = '';
    this.guardando = true;

    if (this.modoEditar && this.idEditando !== null) {
      const datos = {
        nombre:          this.form.nombre,
        fechaNacimiento: this.form.fechaNacimiento || null,
        numeroMatricula: this.form.numeroMatricula || null,
        carrera:         this.form.carrera || null,
        anioIngreso:     this.form.anioIngreso || null
      };
      this.service.actualizar(this.idEditando, datos).subscribe({
        next: () => { this.resetForm(); this.cargarLista(); },
        error: (err) => { this.errorForm = err.error?.error ?? 'Error al actualizar'; this.guardando = false; }
      });
    } else {
      const datos = {
        username:        this.form.username,
        email:           this.form.email,
        password:        this.form.password,
        nombre:          this.form.nombre,
        fechaNacimiento: this.form.fechaNacimiento || null,
        numeroMatricula: this.form.numeroMatricula || null,
        carrera:         this.form.carrera || null,
        anioIngreso:     this.form.anioIngreso || null
      };
      this.service.crear(datos).subscribe({
        next: () => {
        this.mensajeExito = 'Estudiante creado exitosamente';
        setTimeout(() => this.mensajeExito = '', 3000);
        this.resetForm();
        this.cargarLista();
      },
        error: (err) => {
          if (err.status === 0) {
            this.errorForm = 'No se puede conectar al servidor. Verifica que GestionEstudiantes (8082) está iniciado.';
          } else {
            this.errorForm = err.error?.error ?? 'Error al crear estudiante';
          }
          this.guardando = false;
        }
      });
    }
  }

  editar(e: Estudiante): void {
    this.idEditando       = e.id;
    this.modoEditar       = true;
    this.mostrarForm      = true;
    this.errorForm        = '';
    this.form.nombre          = e.nombre;
    this.form.fechaNacimiento = e.fechaNacimiento ?? '';
    this.form.numeroMatricula = e.numeroMatricula ?? '';
    this.form.carrera         = e.carrera ?? '';
    this.form.anioIngreso     = e.anioIngreso ?? null;
    this.form.username = '';
    this.form.email    = '';
    this.form.password = '';
  }

  desactivar(id: number): void {
    if (!confirm('Desactivar este estudiante?')) return;
    this.service.desactivar(id).subscribe({
      next: () => this.cargarLista(),
      error: () => { this.error = 'Error al desactivar'; }
    });
  }

  resetForm(): void {
    this.form = { username: '', email: '', password: '', nombre: '', fechaNacimiento: '', numeroMatricula: '', carrera: '', anioIngreso: null };
    this.mostrarForm = false;
    this.modoEditar  = false;
    this.guardando   = false;
    this.errorForm   = '';
    this.idEditando  = null;
  }

  esEstudiante(): boolean { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDocente():    boolean { return this.rol === 'ROLE_DOCENTE'; }
  esDirectivo():  boolean { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }
  volver():       void    { this.router.navigate(['/home']); }
}
