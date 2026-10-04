import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-frame">
      <app-sidebar></app-sidebar>

      <div class="main-wrapper">
        <app-topbar></app-topbar>

        <main class="content-body">
          <router-outlet></router-outlet>
        </main>

        <footer class="app-footer"><i class="bi bi-check-circle me-1"></i> <strong>AutoNova Motors S.A.</strong> · Plataforma integral para la gestión vehicular</footer>
      </div>
    </div>
  `,
  styles: [':host { display: block; width: 100%; height: 100dvh; min-height: 0; }'],
})
export class AppShellComponent implements OnInit {
  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    void this.auth.initialize();
  }
}
