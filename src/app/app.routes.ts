import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },   // 👈 ahora entra al inicio
  { path: 'login', component: LoginComponent }
];