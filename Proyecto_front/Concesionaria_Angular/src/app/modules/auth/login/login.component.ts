import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="login-screen">
      <section class="login-hero">
        <header class="login-brand-row">
          <div class="login-brand">
            <span class="login-brand-icon"><i class="bi bi-car-front-fill"></i></span>
            <div><strong>AutoNova Motors</strong><small>INTRANET ENTERPRISE</small></div>
          </div>
          <span class="login-status"><i class="bi bi-circle-fill"></i> Sistemas Operativos 100%</span>
        </header>

        <div class="login-pitch">
          <span class="login-kicker"><i class="bi bi-shield-check"></i> Ecosistema Digital Automotriz v10.0</span>
          <h1>Gestión Integral de Flotas, Reservas y Clientes.</h1>
          <p>Optimice la rotación de vehículos comerciales, la disponibilidad de unidades en showroom y la trazabilidad de contratos con control estricto de roles.</p>

          <div class="login-benefits">
            <article><i class="bi bi-box-seam"></i><strong>Stock en Vivo</strong><span>Sincronización multi-sede</span></article>
            <article><i class="bi bi-calendar-event"></i><strong>Reservas 24/7</strong><span>Test drives y apartado</span></article>
            <article><i class="bi bi-person-badge"></i><strong>Acceso por roles</strong><span>Permisos según responsabilidades</span></article>
          </div>
        </div>

        <footer class="login-hero-footer"><span><i class="bi bi-shield-lock"></i> Acceso protegido para el personal autorizado</span><span>TLS 1.3 · AES-256</span></footer>
      </section>

      <section class="login-panel">
        <span class="login-environment">Ambiente Institucional Cátedra</span>
        <div class="login-form-wrap">
          <div class="login-key-icon"><i class="bi bi-key-fill"></i></div>
          <ng-container *ngIf="!registeringAdmin; else bootstrapForm">
            <h2>Iniciar Sesión</h2>
            <p>Bienvenido a la Intranet Concesionaria. Ingrese sus credenciales autorizadas para continuar.</p>

            <form (ngSubmit)="submit()">
              <label class="login-field">
                <span>CORREO CORPORATIVO</span>
                <div class="login-input-group"><i class="bi bi-envelope"></i><input type="email" [(ngModel)]="email" name="email" autocomplete="username" placeholder="tu-correo@ejemplo.com" required /></div>
              </label>

              <label class="login-field">
                <span>CONTRASEÑA</span>
                <div class="login-input-group"><i class="bi bi-lock"></i><input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" required /></div>
              </label>

              <div class="login-options"><span><i class="bi bi-shield-check"></i> Acceso seguro</span></div>
              <div *ngIf="error" class="login-error" role="alert">{{ error }}</div>
              <button class="login-submit" type="submit" [disabled]="loading">{{ loading ? 'Entrando...' : 'Acceder a la Intranet' }} <i class="bi bi-arrow-right"></i></button>
            </form>
            <button class="login-switch" type="button" (click)="showBootstrapForm()">¿Primera configuración? Crear el primer administrador</button>
            <a class="login-switch text-decoration-none" routerLink="/catalogo-publico"><i class="bi bi-car-front"></i> Ver catálogo sin iniciar sesión</a>
          </ng-container>

          <ng-template #bootstrapForm>
            <h2>Crear administrador</h2>
            <p>Este registro solo se permite mientras la base de datos no tenga usuarios. La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.</p>

            <form (ngSubmit)="createFirstAdmin()">
              <div class="bootstrap-fields">
                <label class="login-field"><span>NOMBRES</span><div class="login-input-group"><i class="bi bi-person"></i><input [(ngModel)]="firstName" name="firstName" autocomplete="given-name" required /></div></label>
                <label class="login-field"><span>APELLIDOS</span><div class="login-input-group"><i class="bi bi-person"></i><input [(ngModel)]="lastName" name="lastName" autocomplete="family-name" required /></div></label>
              </div>
              <label class="login-field"><span>DNI (8 DÍGITOS)</span><div class="login-input-group"><i class="bi bi-card-text"></i><input [(ngModel)]="dni" name="dni" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" required /></div></label>
              <label class="login-field"><span>CORREO CORPORATIVO</span><div class="login-input-group"><i class="bi bi-envelope"></i><input type="email" [(ngModel)]="email" name="bootstrapEmail" autocomplete="email" placeholder="tu-correo@ejemplo.com" required /></div></label>
              <label class="login-field"><span>CONTRASEÑA</span><div class="login-input-group"><i class="bi bi-lock"></i><input type="password" [(ngModel)]="password" name="bootstrapPassword" autocomplete="new-password" [pattern]="passwordPattern" minlength="8" required /></div><small class="password-help"><i class="bi bi-info-circle"></i> Mínimo 8 caracteres, una mayúscula y un número.</small></label>
              <div *ngIf="error" class="login-error" role="alert">{{ error }}</div>
              <button class="login-submit" type="submit" [disabled]="loading">{{ loading ? 'Creando cuenta...' : 'Crear primer administrador' }} <i class="bi bi-arrow-right"></i></button>
            </form>
            <button class="login-switch" type="button" (click)="showLoginForm()"><i class="bi bi-arrow-left"></i> Volver al inicio de sesión</button>
          </ng-template>
        </div>

        <footer class="login-panel-footer"><span>Acceso seguro para el personal de AutoNova Motors</span><span>© 2026 Concesionaria AutoNova Motors S.A. - Sistema de Gestión Vehicular</span></footer>
      </section>
    </main>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .login-screen { display: grid; min-height: 100vh; grid-template-columns: minmax(0, 7fr) minmax(380px, 5fr); background: #0b111e; color: #fff; }
      .login-hero { display: flex; min-height: 100vh; flex-direction: column; justify-content: space-between; padding: 2.5rem; border-right: 1px solid #26354d; background: linear-gradient(135deg, rgb(11 17 30 / 88%), rgb(19 28 46 / 94%)), url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80') center / cover no-repeat; }
      .login-brand-row, .login-brand, .login-hero-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .login-brand { justify-content: flex-start; }
      .login-brand-icon, .login-key-icon { display: grid; width: 40px; height: 40px; flex: 0 0 40px; place-items: center; border-radius: 8px; background: #2563eb; color: white; font-size: 1.2rem; }
      .login-brand strong, .login-brand small { display: block; }
      .login-brand strong { font-size: 1rem; }
      .login-brand small, .login-status, .login-hero-footer { color: #8a99ad; font-size: .725rem; }
      .login-status { padding: .4rem .7rem; border: 1px solid rgb(16 185 129 / 20%); border-radius: 20px; background: rgb(16 185 129 / 10%); color: #10b981; }
      .login-status i { margin-right: .35rem; font-size: .55rem; }
      .login-pitch { width: min(100%, 650px); margin: auto 0; padding: 1.5rem 0; }
      .login-kicker, .login-environment { display: inline-block; padding: .4rem .65rem; border: 1px solid rgb(37 99 235 / 20%); border-radius: 5px; background: rgb(37 99 235 / 10%); color: #60a5fa; font-size: .75rem; }
      .login-pitch h1 { max-width: 650px; margin: 1rem 0; color: white; font-size: clamp(2rem, 3.2vw, 3.25rem); font-weight: 700; line-height: 1.08; }
      .login-pitch > p, .login-form-wrap > p { max-width: 600px; color: #8a99ad; line-height: 1.65; }
      .login-benefits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; margin-top: 2rem; }
      .login-benefits article { display: flex; min-height: 88px; flex-direction: column; padding: .75rem; border: 1px solid #26354d; border-radius: 8px; background: rgb(19 28 46 / 78%); }
      .login-benefits i { margin-bottom: .5rem; color: #60a5fa; font-size: 1rem; }
      .login-benefits strong { margin-bottom: .25rem; font-size: .85rem; }
      .login-benefits span { color: #8a99ad; font-size: .7rem; }
      .login-hero-footer { flex-wrap: wrap; }
      .login-panel { display: flex; min-height: 100vh; flex-direction: column; justify-content: space-between; padding: 2rem clamp(1.5rem, 4vw, 4rem); background: #0b111e; }
      .login-environment { align-self: flex-end; }
      .login-form-wrap { width: min(100%, 440px); margin: auto; padding: 2rem 0; }
      .login-key-icon { margin-bottom: 1.25rem; }
      .login-form-wrap h2 { margin: 0 0 .5rem; color: #fff; font-size: 1.8rem; font-weight: 700; }
      .login-form-wrap > p { margin-bottom: 1.75rem; font-size: .875rem; }
      .login-form-wrap form { display: grid; gap: 1rem; }
      .login-field { display: grid; gap: .45rem; color: #8a99ad; font-size: .68rem; font-weight: 700; }
      .login-input-group { display: flex; min-height: 42px; align-items: center; border: 1px solid #26354d; border-radius: 5px; background: #1a263b; }
      .login-input-group i { padding: 0 .75rem; color: #8a99ad; }
      .login-input-group input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #fff; font-size: .875rem; }
      .login-input-group input::placeholder { color: #64748b; }
      .login-input-group:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 20%); }
      .password-help { color: #8a99ad; font-size: .7rem; font-weight: 400; }
      .password-help i { margin-right: .2rem; color: #60a5fa; }
      .login-options { display: flex; align-items: center; justify-content: space-between; gap: .75rem; color: #8a99ad; font-size: .75rem; }
      .login-options label { display: flex; align-items: center; gap: .45rem; }
      .login-options input { accent-color: #2563eb; }
      .login-options > span { color: #60a5fa; white-space: nowrap; }
      .login-submit { display: flex; min-height: 42px; align-items: center; justify-content: center; gap: .5rem; border: 0; border-radius: 5px; background: #2563eb; color: white; font-weight: 600; cursor: pointer; }
      .login-submit:hover { background: #1d4ed8; }
      .login-submit:disabled { opacity: .65; cursor: wait; }
      .login-switch { display: block; margin-top: .4rem; width: 100%; margin-top: 1.1rem; padding: .4rem 0; border: 0; background: transparent; color: #60a5fa; font-size: .78rem; text-align: center; cursor: pointer; }
      .login-switch:hover { color: #93c5fd; text-decoration: underline; }
      .bootstrap-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
      .login-error { padding: .65rem; border: 1px solid #7f1d1d; border-radius: 5px; background: #450a0a; color: #fecaca; font-size: .85rem; }
      .login-panel-footer { display: grid; gap: .25rem; padding-top: 1rem; border-top: 1px solid #26354d; color: #8a99ad; font-size: .68rem; text-align: center; }
      @media (min-width: 1200px) { .login-screen { grid-template-columns: minmax(0, 8fr) minmax(400px, 4fr); } }
      @media (max-width: 991px) { .login-screen { display: block; } .login-hero { display: none; } .login-panel { min-height: 100vh; padding: 1.5rem; } .login-form-wrap { max-width: 460px; } }
      @media (max-width: 480px) { .login-benefits { grid-template-columns: 1fr; } .login-options { align-items: flex-start; flex-direction: column; } .bootstrap-fields { grid-template-columns: 1fr; } }
    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  dni = '';
  registeringAdmin = false;
  readonly passwordPattern = '(?=.*[A-Z])(?=.*[0-9]).{8,}';
  loading = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    void this.auth.login({ email: this.email, password: this.password }).then(() => this.finishLogin()).catch((err: Error) => {
      this.error = err.message;
      this.loading = false;
      this.changeDetector.markForCheck();
    });
  }

  showBootstrapForm(): void {
    this.error = '';
    this.password = '';
    this.registeringAdmin = true;
    this.changeDetector.markForCheck();
  }

  showLoginForm(): void {
    this.error = '';
    this.password = '';
    this.registeringAdmin = false;
    this.changeDetector.markForCheck();
  }

  createFirstAdmin(): void {
    this.loading = true;
    this.error = '';
    void this.auth.bootstrapAdmin({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      dni: this.dni,
      email: this.email.trim(),
      password: this.password,
    }).then(() => this.finishLogin()).catch((err: Error) => {
      this.error = err.message;
      this.loading = false;
      this.changeDetector.markForCheck();
    });
  }

  private finishLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const landingRoutes = {
      ADMIN: '/dashboard',
      ASESOR_VENTAS: '/clients',
      JEFE_ALMACEN: '/vehicles',
      SIN_ROL: '/catalogo-publico',
    } as const;
    const defaultRoute = landingRoutes[this.auth.role()];
    const safeReturnUrl = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : defaultRoute;
    this.loading = false;
    this.changeDetector.markForCheck();
    void this.router.navigateByUrl(safeReturnUrl);
  }
}
