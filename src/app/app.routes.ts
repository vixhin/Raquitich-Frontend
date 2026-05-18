import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomeComponent } from './pages/home/home';
import { AcademicaComponent } from './pages/academica/academica';
import { GestionEstudiantesComponent } from './pages/estudiantes/gestion-estudiantes';
import { ObservacionesComponent } from './pages/observaciones/observaciones';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',             component: LoginComponent },
  { path: 'home',         component: HomeComponent,               canActivate: [authGuard] },
  { path: 'academica',    component: AcademicaComponent,          canActivate: [authGuard] },
  { path: 'estudiantes',  component: GestionEstudiantesComponent, canActivate: [authGuard] },
  { path: 'observaciones',component: ObservacionesComponent,      canActivate: [authGuard] },
  { path: '**',           redirectTo: '' }
];
