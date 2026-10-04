import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Sale } from '../../models/sale.model';
import { ConcesionariaService } from '../../services/concesionaria.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="page-header">
      <div><h1>Ventas concretadas</h1><p>Historial de operaciones cerradas y sus importes finales.</p></div>
      <a class="btn btn-primary" routerLink="/reservations"><i class="bi bi-bag-check me-1"></i> Concretar desde una reserva</a>
    </section>

    @if (error()) {
      <div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error() }}</div>
    }

    <div class="row g-3 mb-3">
      <div class="col-sm-4"><div class="card"><div class="card-body py-2"><div class="metric-label">VENTAS</div><div class="metric-value">{{ sales().length }}</div></div></div></div>
      <div class="col-sm-4"><div class="card"><div class="card-body py-2"><div class="metric-label">TOTAL FACTURADO</div><div class="metric-value text-success">{{ totalAmount() | currency:'USD':'symbol':'1.0-0' }}</div></div></div></div>
      <div class="col-sm-4"><div class="card"><div class="card-body py-2"><div class="metric-label">TICKET PROMEDIO</div><div class="metric-value">{{ averageAmount() | currency:'USD':'symbol':'1.0-0' }}</div></div></div></div>
    </div>

    <div class="card">
      <div class="card-header py-3">
        <div class="input-group input-group-sm" style="max-width: 360px">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input class="form-control" type="search" placeholder="Buscar por cliente, vehículo o VIN" [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Vehículo</th><th>Vendedor</th><th>Reserva</th><th class="text-end">Importe final</th></tr></thead>
          <tbody>
            @for (sale of filteredSales(); track sale.id) {
              <tr>
                <td class="text-secondary">{{ sale.id }}</td>
                <td>{{ sale.completedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="fw-semibold">{{ sale.clientName || ('Cliente #' + sale.clientId) }}</td>
                <td><div>{{ sale.makeModel }}</div><small class="text-secondary vin">{{ sale.vin }}</small></td>
                <td>{{ sale.sellerName || ('Usuario #' + sale.sellerId) }}</td>
                <td><span class="badge text-bg-light border">#{{ sale.reservationId }}</span></td>
                <td class="text-end fw-semibold">{{ sale.finalAmount | currency:'USD':'symbol':'1.2-2' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="text-center text-secondary py-4">{{ loading() ? 'Cargando ventas...' : 'Todavía no hay ventas concretadas. Puedes confirmar una desde Reservas.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class SalesListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  readonly sales = signal<Sale[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');

  readonly totalAmount = computed(() => this.sales().reduce((sum, sale) => sum + Number(sale.finalAmount), 0));
  readonly averageAmount = computed(() => (this.sales().length ? this.totalAmount() / this.sales().length : 0));
  readonly filteredSales = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.sales().filter((sale) =>
      !query || `${sale.clientName ?? ''} ${sale.makeModel} ${sale.vin}`.toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.service.getSales().subscribe({
      next: (sales) => { this.sales.set(sales); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); },
    });
  }
}
