import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { GestionEstudiantesService, Estudiante } from '../../services/gestion-estudiantes.service';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.html',
  styleUrls: ['./gestion-estudiantes.scss']
})
export class GestionEstudiantesComponent implements OnInit {

  estudiantes: Estudiante[] = [];
  perfil: Estudiante | null = null;
  editandoId: number | null = null;
  mostrarForm = false;
  mensajeExito = '';
  mensajeError  = '';

  form = {
    username:       '',
    rut:            '',
    email:          '',
    nombre:         '',
    fechaNacimiento:'',
    numeroMatricula:'',
    carrera:        '',
    anioIngreso:    null as number | null,
  };

  private rol: string;

  constructor(
    private service: GestionEstudiantesService,
    private auth: AuthService,
    private router: Router
  ) {
    this.rol = this.auth.getRole();
  }

  ngOnInit(): void {
    if (this.esEstudiante()) {
      this.service.miPerfil().subscribe({
        next: p => this.perfil = p,
        error: () => this.mensajeError = 'No se pudo cargar el perfil.'
      });
    } else {
      this.cargarEstudiantes();
    }
  }

  cargarEstudiantes(): void {
    this.service.listar().subscribe({
      next: data => this.estudiantes = data,
      error: () => this.mensajeError = 'Error al cargar estudiantes.'
    });
  }

  esEstudiante(): boolean { return this.rol === 'ROLE_ESTUDIANTE'; }
  esDocente():    boolean { return this.rol === 'ROLE_DOCENTE'; }
  esDirectivo():  boolean { return this.rol === 'ROLE_DIRECTIVO' || this.rol === 'ROLE_ADMIN'; }

  abrirForm(): void {
    this.resetForm();
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.resetForm();
  }

  editar(e: Estudiante): void {
    this.editandoId     = e.id;
    this.form.username  = e.username;
    this.form.rut       = e.rut ?? '';
    this.form.email     = e.email;
    this.form.nombre    = e.nombre;
    this.form.fechaNacimiento = e.fechaNacimiento ?? '';
    this.form.numeroMatricula = e.numeroMatricula ?? '';
    this.form.carrera   = e.carrera ?? '';
    this.form.anioIngreso = e.anioIngreso;
    this.mostrarForm    = true;
  }

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError  = '';

    const payload: any = {
      username:        this.form.username || undefined,
      rut:             this.form.rut      || null,
      email:           this.form.email,
      nombre:          this.form.nombre,
      fechaNacimiento: this.form.fechaNacimiento || null,
      numeroMatricula: this.form.numeroMatricula || null,
      carrera:         this.form.carrera         || null,
      anioIngreso:     this.form.anioIngreso     || null,
    };

    if (this.editandoId !== null) {
      this.service.actualizar(this.editandoId, payload).subscribe({
        next: () => {
          this.mensajeExito = 'Estudiante actualizado correctamente.';
          this.cerrarForm();
          this.cargarEstudiantes();
        },
        error: () => this.mensajeError = 'Error al actualizar el estudiante.'
      });
    } else {
      this.service.crear(payload).subscribe({
        next: () => {
          this.mensajeExito = 'Estudiante creado correctamente.';
          this.cerrarForm();
          this.cargarEstudiantes();
        },
        error: () => this.mensajeError = 'Error al crear el estudiante.'
      });
    }
  }

  desactivar(id: number): void {
    if (!confirm('¿Desactivar este estudiante?')) return;
    this.service.desactivar(id).subscribe({
      next: () => {
        this.mensajeExito = 'Estudiante desactivado.';
        this.cargarEstudiantes();
      },
      error: () => this.mensajeError = 'Error al desactivar.'
    });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  private resetForm(): void {
    this.editandoId      = null;
    this.form = {
      username: '', rut: '', email: '', nombre: '',
      fechaNacimiento: '', numeroMatricula: '', carrera: '', anioIngreso: null
    };
  }
}
