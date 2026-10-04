import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="top-navbar">
      <div class="breadcrumb-label"><i class="bi bi-grid-3x3-gap-fill"></i><span>Inicio / {{ pageTitle }}</span></div>
      <div class="user-tools">
        <span class="system-status d-none d-md-inline"><i class="bi bi-shield-lock-fill text-primary"></i> {{ auth.isAuthenticated() ? 'Sesión activa' : 'Modo público' }}</span>
        <div class="user-identity"><strong>{{ auth.user() ? auth.user()!.firstName + ' ' + auth.user()!.lastName : 'Invitado' }}</strong><small>{{ auth.user()?.roleName || 'Sin sesión' }}</small></div>
        <button *ngIf="auth.isAuthenticated()" class="btn btn-sm btn-outline-secondary" type="button" title="Cerrar sesión" aria-label="Cerrar sesión" (click)="logout()"><i class="bi bi-box-arrow-right"></i></button>
        <a *ngIf="!auth.isAuthenticated()" class="btn btn-sm btn-primary" routerLink="/login" title="Iniciar sesión" aria-label="Iniciar sesión"><i class="bi bi-box-arrow-in-right me-1"></i>Ingresar</a>
        <div class="avatar-circle"><i class="bi bi-person-fill"></i></div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get pageTitle(): string {
    const titles: Record<string, string> = {
      dashboard: 'Panel de Control', vehicles: 'Catálogo de Vehículos', inventory: 'Gestión de Almacén',
      clients: 'Clientes', reservations: 'Reservas', sales: 'Gestión de Ventas', users: 'Usuarios',
      'catalogo-publico': 'Catálogo de Vehículos',
    };
    return titles[this.router.url.split(/[/?#]/)[1]] ?? 'Catálogo de Vehículos';
  }

  logout(): void {
    void this.auth.logout();
  }
}
