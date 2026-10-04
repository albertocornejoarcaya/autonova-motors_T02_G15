import { Routes } from '@angular/router';
import { AppShellComponent } from './components/layout/app-shell.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'catalogo-publico', pathMatch: 'full' },
      {
        path: 'catalogo-publico',
        loadComponent: () => import('./modules/vehicles/catalogo-publico.component').then((m) => m.CatalogoPublicoComponent),
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'vehicles',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'JEFE_ALMACEN'] },
        loadComponent: () => import('./modules/vehicles/vehicle-list.component').then((m) => m.VehicleListComponent),
      },
      {
        path: 'inventory',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'JEFE_ALMACEN'] },
        loadComponent: () => import('./modules/inventory/inventory-list.component').then((m) => m.InventoryListComponent),
      },
      {
        path: 'clients',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'ASESOR_VENTAS'] },
        loadComponent: () => import('./modules/clients/client-list.component').then((m) => m.ClientListComponent),
      },
      {
        path: 'reservations',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'ASESOR_VENTAS'] },
        loadComponent: () => import('./modules/reservations/reservation-list.component').then((m) => m.ReservationListComponent),
      },
      {
        path: 'users',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./modules/users/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'sales',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'ASESOR_VENTAS'] },
        loadComponent: () => import('./modules/sales/sales-list.component').then((m) => m.SalesListComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
