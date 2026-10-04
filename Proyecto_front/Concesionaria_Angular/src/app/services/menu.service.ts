import { Injectable } from '@angular/core';
import { UserRole } from '../models/auth.model';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  rolesPermitidos: UserRole[];
  section: string;
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly items: MenuItem[] = [
    { label: 'Inicio', icon: 'bi-grid-fill', route: '/dashboard', rolesPermitidos: ['ADMIN'], section: 'PRINCIPAL' },
    { label: 'Catálogo de vehículos', icon: 'bi-card-list', route: '/catalogo-publico', rolesPermitidos: ['SIN_ROL', 'ASESOR_VENTAS'], section: 'INVENTARIO' },
    { label: 'Catálogo de vehículos', icon: 'bi-card-list', route: '/vehicles', rolesPermitidos: ['ADMIN', 'JEFE_ALMACEN'], section: 'INVENTARIO' },
    { label: 'Gestión de almacén', icon: 'bi-box-seam', route: '/inventory', rolesPermitidos: ['ADMIN', 'JEFE_ALMACEN'], section: 'INVENTARIO' },
    { label: 'Clientes', icon: 'bi-people', route: '/clients', rolesPermitidos: ['ADMIN', 'ASESOR_VENTAS'], section: 'COMERCIAL' },
    { label: 'Reservas', icon: 'bi-calendar-check', route: '/reservations', rolesPermitidos: ['ADMIN', 'ASESOR_VENTAS'], section: 'COMERCIAL' },
    { label: 'Gestión de ventas', icon: 'bi-receipt', route: '/sales', rolesPermitidos: ['ADMIN', 'ASESOR_VENTAS'], section: 'COMERCIAL' },
    { label: 'Usuarios', icon: 'bi-person-gear', route: '/users', rolesPermitidos: ['ADMIN'], section: 'ADMINISTRACIÓN' },
  ];

  menuFor(role: UserRole): MenuItem[] {
    return this.items.filter((item) => item.rolesPermitidos.includes(role));
  }

  sectionsFor(role: UserRole): MenuSection[] {
    const menu = this.menuFor(role);
    return [...new Set(menu.map((item) => item.section))]
      .map((label) => ({ label, items: menu.filter((item) => item.section === label) }));
  }
}