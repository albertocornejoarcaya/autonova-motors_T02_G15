import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-content">
        <div class="sidebar-brand">
          <div class="brand-box-icon"><i class="bi bi-car-front-fill"></i></div>
          <div><strong>AutoNova Motors</strong><small>Gestión integral vehicular</small></div>
        </div>
        <nav class="sidebar-nav" aria-label="Navegación principal">
          <ng-container *ngFor="let section of sections()">
            <span class="sidebar-section">{{ section.label }}</span>
            <a *ngFor="let item of section.items" class="sidebar-item" [routerLink]="item.route"
               routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              <i class="bi" [class]="'bi ' + item.icon"></i>{{ item.label }}
            </a>
          </ng-container>
        </nav>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; width: 250px; height: 100%; min-height: 0; flex: 0 0 250px; }
    .sidebar { width: 100%; height: 100%; min-height: 100%; overflow-x: hidden; overflow-y: auto; }
    .sidebar-content { min-height: 100%; }
    @media (max-width: 760px) {
      :host { width: 100%; height: auto; min-height: 0; flex: none; }
      .sidebar { height: auto; min-height: 0; overflow: visible; }
      .sidebar-content { min-height: 0; }
    }
  `],
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly menu = inject(MenuService);
  readonly sections = computed(() => this.menu.sectionsFor(this.auth.role()));
}