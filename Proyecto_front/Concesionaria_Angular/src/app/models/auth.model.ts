export type UserRole = 'ADMIN' | 'ASESOR_VENTAS' | 'JEFE_ALMACEN' | 'SIN_ROL';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BootstrapAdminRequest {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: string;
  message: string;
}
