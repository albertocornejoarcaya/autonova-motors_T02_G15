import { computed, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, BootstrapAdminRequest, LoginRequest, UserRole } from '../models/auth.model';
import { friendlyMessage } from './concesionaria.service';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: UserRole;
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<AuthenticatedUser | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly role = computed<UserRole>(() => this.currentUser()?.role ?? 'SIN_ROL');
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isReady = signal(false);
  private initialization?: Promise<void>;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  initialize(): Promise<void> {
    this.initialization ??= firstValueFrom(
      this.http.get<AuthResponse>('/api/auth/me', { withCredentials: true }),
    ).then((response) => {
      this.currentUser.set(this.toUser(response));
      this.isReady.set(true);
    }).catch(() => {
      this.currentUser.set(null);
      this.isReady.set(true);
    });
    return this.initialization;
  }

  async login(payload: LoginRequest): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>('/api/auth/login', payload, { withCredentials: true }),
      );
      this.currentUser.set(this.toUser(response));
      this.isReady.set(true);
      this.initialization = Promise.resolve();
    } catch (error) {
      throw this.authError(error, 'login');
    }
  }

  async bootstrapAdmin(payload: BootstrapAdminRequest): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>('/api/auth/bootstrap-admin', payload, { withCredentials: true }),
      );
      this.currentUser.set(this.toUser(response));
      this.isReady.set(true);
      this.initialization = Promise.resolve();
    } catch (error) {
      throw this.authError(error, 'bootstrap');
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/logout', {}, { withCredentials: true }));
    } catch {
      // Clear local auth state even when the server session has already expired.
    } finally {
      this.currentUser.set(null);
      this.isReady.set(true);
      this.initialization = Promise.resolve();
      await this.router.navigateByUrl('/login');
    }
  }

  private toUser(response: AuthResponse): AuthenticatedUser {
    const roles: Record<number, UserRole> = { 1: 'ADMIN', 2: 'ASESOR_VENTAS', 3: 'JEFE_ALMACEN' };
    const roleNames: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      ASESOR_VENTAS: 'Asesor de Ventas',
      JEFE_ALMACEN: 'Jefe de Almacén',
      SIN_ROL: 'Sin rol',
    };
    const role = roles[response.roleId] ?? 'SIN_ROL';

    return {
      userId: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roleId: response.roleId,
      role,
      roleName: response.role || roleNames[role],
    };
  }

  private authError(error: unknown, operation: 'login' | 'bootstrap'): Error {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401 && operation === 'login') {
      return new Error('Correo o contraseña incorrectos, o la cuenta está inactiva.');
    }
    if (status === 409 && operation === 'bootstrap') {
      return new Error('Ya existe un usuario en el sistema. Inicia sesión con una cuenta existente.');
    }
    return new Error(friendlyMessage(error));
  }
}