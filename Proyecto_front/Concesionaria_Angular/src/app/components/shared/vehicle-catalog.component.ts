import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Vehicle } from '../../models/vehicle.model';
import { AuthService } from '../../services/auth.service';
import { ConcesionariaService } from '../../services/concesionaria.service';

/** Catálogo de vehículos en tarjetas Bootstrap, con búsqueda, filtros y acceso a reserva. */
@Component({
  selector: 'app-vehicle-catalog',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section class="page-header">
      <div><h1>{{ heading() }}</h1><p>{{ subtitle() }}</p></div>
      <span class="badge text-bg-light border"><i class="bi bi-car-front-fill text-primary me-1"></i>{{ filteredVehicles().length }} unidades</span>
    </section>

    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-5">
            <label class="form-label" for="search">Búsqueda</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input id="search" class="form-control" type="search" placeholder="Modelo, marca o VIN..." [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label" for="category">Categoría</label>
            <select id="category" class="form-select" [ngModel]="category()" (ngModelChange)="category.set($event)" name="category">
              <option value="">Todas</option>
              @for (item of categories(); track item) { <option [value]="item">{{ item }}</option> }
            </select>
          </div>
          <div class="col-6 col-md-2">
            <label class="form-label" for="maxPrice">Precio máx. (USD)</label>
            <input id="maxPrice" class="form-control" type="number" min="0" step="1000" placeholder="Sin límite" [ngModel]="maxPrice()" (ngModelChange)="maxPrice.set($event)" name="maxPrice" />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <div class="form-check form-switch mb-2">
              <input id="onlyAvailable" class="form-check-input" type="checkbox" [ngModel]="onlyAvailable()" (ngModelChange)="onlyAvailable.set($event)" name="onlyAvailable" />
              <label class="form-check-label small" for="onlyAvailable">Solo disponibles</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    @if (error()) {
      <div class="alert alert-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>{{ error() }}</div>
    }

    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
      @for (vehicle of filteredVehicles(); track vehicle.vin) {
        <div class="col">
          <div class="card h-100 vehicle-card">
            <div class="position-relative vehicle-image">
              <img class="card-img-top" [src]="vehicle.imageUrl || fallbackImage" [alt]="vehicle.makeModel" (error)="onImageError($event)" />
              <span class="badge position-absolute top-0 end-0 m-2" [class]="'badge position-absolute top-0 end-0 m-2 ' + statusBadge(vehicle.status)">{{ vehicle.status || 'Disponible' }}</span>
              <span class="badge text-bg-dark bg-opacity-75 position-absolute bottom-0 start-0 m-2">Lote: {{ vehicle.lot || 'General' }}</span>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <h2 class="card-title mb-0">{{ vehicle.makeModel }} {{ vehicle.year }}</h2>
                <span class="badge text-bg-light border">{{ vehicle.category }}</span>
              </div>
              <p class="small text-secondary mb-2">VIN: <span class="vin">{{ vehicle.vin }}</span></p>
              @if (vehicle.specifications) { <p class="small mb-2">{{ vehicle.specifications }}</p> }
              <div class="row g-0 text-center border rounded bg-light py-2 vehicle-specs mt-auto">
                <div class="col border-end"><i class="bi bi-fuel-pump d-block text-secondary"></i>{{ vehicle.fuel || '—' }}</div>
                <div class="col border-end"><i class="bi bi-gear-wide-connected d-block text-secondary"></i>{{ vehicle.transmission || '—' }}</div>
                <div class="col"><i class="bi bi-cpu d-block text-secondary"></i>{{ vehicle.engine || '—' }}</div>
              </div>
            </div>
            <div class="card-footer bg-white d-flex justify-content-between align-items-center">
              <div><div class="fw-bold fs-5">{{ vehicle.price | currency:'USD':'symbol':'1.0-0' }}</div><small class="text-secondary">{{ vehicle.stock }} en stock</small></div>
              @if (canReserve()) {
                <button class="btn btn-primary btn-sm" type="button" (click)="reserve(vehicle)" [disabled]="!isAvailable(vehicle)">
                  <i class="bi bi-calendar-check me-1"></i>{{ isAvailable(vehicle) ? 'Reservar' : 'No disponible' }}
                </button>
              }
            </div>
          </div>
        </div>
      } @empty {
        <div class="col-12">
          <div class="text-center text-secondary py-5">
            @if (loading()) { <span class="spinner-border spinner-border-sm me-1"></span> Cargando catálogo... }
            @else { <i class="bi bi-search fs-3 d-block mb-2"></i>No se encontraron vehículos con esos filtros. }
          </div>
        </div>
      }
    </div>
  `,
})
export class VehicleCatalogComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly heading = input('Catálogo de Vehículos');
  readonly subtitle = input('Explora las unidades disponibles en AutoNova Motors.');

  /** Imagen de respaldo embebida (no depende de internet). */
  readonly fallbackImage = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180"><rect width="400" height="180" fill="#e2e8f0"/>'
    + '<path d="M120 115h160l-18-36a12 12 0 0 0-11-7H149a12 12 0 0 0-11 7z" fill="#94a3b8"/>'
    + '<rect x="105" y="112" width="190" height="28" rx="8" fill="#64748b"/>'
    + '<circle cx="145" cy="142" r="13" fill="#334155"/><circle cx="255" cy="142" r="13" fill="#334155"/>'
    + '<text x="200" y="168" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Imagen no disponible</text></svg>');
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly category = signal('');
  readonly maxPrice = signal<number | null>(null);
  readonly onlyAvailable = signal(false);

  /** El Jefe de Almacén no gestiona reservas; el resto (o un visitante) ve el botón. */
  readonly canReserve = computed(() => this.auth.role() !== 'JEFE_ALMACEN');
  readonly categories = computed(() => [...new Set(this.vehicles().map((vehicle) => vehicle.category))].sort());
  readonly filteredVehicles = computed(() => {
    const query = this.search().trim().toLowerCase();
    const category = this.category();
    const maxPrice = Number(this.maxPrice()) || 0;
    return this.vehicles().filter((vehicle) =>
      (!query || `${vehicle.makeModel} ${vehicle.vin} ${vehicle.category}`.toLowerCase().includes(query))
      && (!category || vehicle.category === category)
      && (!maxPrice || Number(vehicle.price) <= maxPrice)
      && (!this.onlyAvailable() || this.isAvailable(vehicle)));
  });

  ngOnInit(): void {
    this.service.getVehicles().subscribe({
      next: (vehicles) => { this.vehicles.set(vehicles); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  isAvailable(vehicle: Vehicle): boolean {
    return vehicle.status === 'Disponible' && vehicle.stock > 0;
  }

  statusBadge(status?: string | null): string {
    switch (status) {
      case 'Disponible': return 'text-bg-success';
      case 'Reservado': return 'text-bg-warning';
      case 'Vendido': return 'text-bg-primary';
      default: return 'text-bg-secondary';
    }
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }

  async reserve(vehicle: Vehicle): Promise<void> {
    await this.auth.initialize();
    const target = `/reservations?vin=${encodeURIComponent(vehicle.vin)}`;
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: target } });
      return;
    }
    void this.router.navigateByUrl(target);
  }
}
