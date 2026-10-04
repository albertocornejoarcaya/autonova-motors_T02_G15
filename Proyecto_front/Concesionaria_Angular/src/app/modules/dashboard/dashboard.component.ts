import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Sale } from '../../models/sale.model';
import { ConcesionariaService } from '../../services/concesionaria.service';

interface DashboardSummary {
  vehicles: number;
  units: number;
  clients: number;
  pendingReservations: number;
  sales: number;
  revenue: number;
  available: number;
  reserved: number;
  sold: number;
  other: number;
  latestSales: Sale[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="page-header align-items-center">
      <div>
        <h1>Panel de Control y Métricas</h1>
        <p>Resumen consolidado del inventario, reservas y actividad comercial.</p>
      </div>
      <button class="btn btn-outline-secondary btn-sm" type="button" (click)="load()" [disabled]="loading()" title="Actualizar datos">
        <i class="bi bi-arrow-clockwise" [class.spin]="loading()"></i> Actualizar
      </button>
    </section>

    @if (error()) {
      <div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error() }}</div>
    }

    @if (summary(); as data) {
      <div class="row g-3 mb-3">
        <div class="col-6 col-xl-3">
          <div class="card h-100"><div class="card-body">
            <div class="d-flex justify-content-between"><span class="metric-label">VEHÍCULOS (MODELOS)</span><span class="icon-tile"><i class="bi bi-car-front"></i></span></div>
            <div class="metric-value my-1">{{ data.vehicles }}</div>
            <small class="text-secondary">{{ data.units }} unidades en stock</small>
          </div></div>
        </div>
        <div class="col-6 col-xl-3">
          <div class="card h-100"><div class="card-body">
            <div class="d-flex justify-content-between"><span class="metric-label">RESERVAS PENDIENTES</span><span class="icon-tile"><i class="bi bi-calendar-event"></i></span></div>
            <div class="metric-value my-1">{{ data.pendingReservations }}</div>
            <a routerLink="/reservations" class="small">Ver reservas</a>
          </div></div>
        </div>
        <div class="col-6 col-xl-3">
          <div class="card h-100"><div class="card-body">
            <div class="d-flex justify-content-between"><span class="metric-label">VENTAS CONCRETADAS</span><span class="icon-tile"><i class="bi bi-receipt"></i></span></div>
            <div class="metric-value my-1">{{ data.sales }}</div>
            <small class="text-secondary">{{ data.revenue | currency:'USD':'symbol':'1.0-0' }} facturados</small>
          </div></div>
        </div>
        <div class="col-6 col-xl-3">
          <div class="card h-100"><div class="card-body">
            <div class="d-flex justify-content-between"><span class="metric-label">CLIENTES</span><span class="icon-tile"><i class="bi bi-people"></i></span></div>
            <div class="metric-value my-1">{{ data.clients }}</div>
            <a routerLink="/clients" class="small">Ver clientes</a>
          </div></div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <h2 class="card-title mb-0">Vehículos por estado</h2>
              <span class="badge text-bg-light border">{{ data.vehicles }} fichas</span>
            </div>
            <div class="card-body d-grid gap-3">
              @for (row of statusRows(data); track row.label) {
                <div>
                  <div class="d-flex justify-content-between small mb-1"><span class="fw-semibold">{{ row.label }}</span><span class="text-secondary">{{ row.value }}</span></div>
                  <div class="progress" role="progressbar" [attr.aria-valuenow]="row.value" style="height: 8px">
                    <div class="progress-bar" [class]="'progress-bar ' + row.css" [style.width.%]="percent(row.value, data.vehicles)"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header py-3"><h2 class="card-title mb-0">Últimas ventas</h2></div>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead><tr><th>Fecha</th><th>Vehículo</th><th>Cliente</th><th class="text-end">Importe</th></tr></thead>
                <tbody>
                  @for (sale of data.latestSales; track sale.id) {
                    <tr>
                      <td>{{ sale.completedAt | date:'dd/MM/yyyy' }}</td>
                      <td>{{ sale.makeModel }}</td>
                      <td>{{ sale.clientName || ('Cliente #' + sale.clientId) }}</td>
                      <td class="text-end fw-semibold">{{ sale.finalAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="text-center text-secondary py-4">Aún no hay ventas registradas.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    } @else if (loading()) {
      <div class="d-flex align-items-center gap-2 text-secondary"><span class="spinner-border spinner-border-sm"></span> Cargando métricas...</div>
    }
  `,
  styles: [`.spin { display: inline-block; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`],
})
export class DashboardComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      vehicles: this.service.getVehicles(),
      clients: this.service.getClients(),
      reservations: this.service.getReservations(),
      sales: this.service.getSales(),
    }).subscribe({
      next: ({ vehicles, clients, reservations, sales }) => {
        const count = (status: string) => vehicles.filter((vehicle) => vehicle.status === status).length;
        this.summary.set({
          vehicles: vehicles.length,
          units: vehicles.reduce((sum, vehicle) => sum + (vehicle.stock || 0), 0),
          clients: clients.length,
          pendingReservations: reservations.filter((reservation) => reservation.status === 'Pendiente').length,
          sales: sales.length,
          revenue: sales.reduce((sum, sale) => sum + Number(sale.finalAmount), 0),
          available: count('Disponible'),
          reserved: count('Reservado'),
          sold: count('Vendido'),
          other: vehicles.filter((vehicle) => !['Disponible', 'Reservado', 'Vendido'].includes(vehicle.status ?? '')).length,
          latestSales: sales.slice(0, 5),
        });
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  statusRows(data: DashboardSummary): { label: string; value: number; css: string }[] {
    return [
      { label: 'Disponibles', value: data.available, css: 'bg-success' },
      { label: 'Reservados', value: data.reserved, css: 'bg-warning' },
      { label: 'Vendidos', value: data.sold, css: 'bg-primary' },
      { label: 'Mantenimiento / otros', value: data.other, css: 'bg-secondary' },
    ];
  }

  percent(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
