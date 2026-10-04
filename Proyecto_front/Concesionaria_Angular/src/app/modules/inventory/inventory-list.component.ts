import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateVehicleRequest, Vehicle } from '../../models/vehicle.model';
import { ConcesionariaService } from '../../services/concesionaria.service';
import { AlertComponent, Feedback } from '../../components/shared/alert.component';

export const VEHICLE_STATUSES = ['Disponible', 'Reservado', 'Mantenimiento', 'Vendido'];

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, AlertComponent],
  template: `
    <section class="page-header">
      <div><h1>Gestión de Almacén e Inventario</h1><p>Consulta y administra existencias, disponibilidad y ubicación de los vehículos.</p></div>
      <button class="btn btn-primary" type="button" (click)="showForm.set(!showForm())">
        <i class="bi" [class.bi-plus-lg]="!showForm()" [class.bi-x-lg]="showForm()"></i>
        {{ showForm() ? 'Cerrar formulario' : 'Agregar vehículo' }}
      </button>
    </section>

    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3"><div class="card"><div class="card-body py-2"><div class="metric-label">STOCK TOTAL</div><div class="metric-value">{{ totalStock() }} <small class="fs-6 text-secondary fw-normal">unid.</small></div></div></div></div>
      <div class="col-6 col-lg-3"><div class="card"><div class="card-body py-2"><div class="metric-label">DISPONIBLES</div><div class="metric-value text-success">{{ availableStock() }} <small class="fs-6 text-secondary fw-normal">unid.</small></div></div></div></div>
      <div class="col-6 col-lg-3"><div class="card"><div class="card-body py-2"><div class="metric-label">RESERVADOS</div><div class="metric-value text-warning">{{ countByStatus('Reservado') }} <small class="fs-6 text-secondary fw-normal">fichas</small></div></div></div></div>
      <div class="col-6 col-lg-3"><div class="card"><div class="card-body py-2"><div class="metric-label">MANTENIMIENTO</div><div class="metric-value text-secondary">{{ countByStatus('Mantenimiento') }} <small class="fs-6 text-secondary fw-normal">fichas</small></div></div></div></div>
    </div>

    @if (showForm()) {
      <div class="card mb-3">
        <div class="card-body">
          <h2 class="card-title">Registro de vehículo</h2>
          <p class="text-secondary small">Alta de una nueva unidad en el catálogo e inventario físico.</p>
          <form #vehicleForm="ngForm" (ngSubmit)="createVehicle(vehicleForm)" novalidate>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label" for="vin">VIN</label>
                <input id="vin" class="form-control text-uppercase" [(ngModel)]="newVehicle.vin" name="vin" #vin="ngModel" maxlength="17"
                       pattern="[A-Za-z0-9]{17}" required placeholder="17 caracteres alfanuméricos"
                       [class.is-invalid]="vin.invalid && (vin.touched || vehicleForm.submitted)" />
                <div class="invalid-feedback">El VIN debe tener 17 caracteres alfanuméricos.</div>
              </div>
              <div class="col-md-5">
                <label class="form-label" for="makeModel">Marca / Modelo</label>
                <input id="makeModel" class="form-control" [(ngModel)]="newVehicle.makeModel" name="makeModel" #makeModel="ngModel" required
                       placeholder="Toyota Corolla XEi" [class.is-invalid]="makeModel.invalid && (makeModel.touched || vehicleForm.submitted)" />
                <div class="invalid-feedback">Ingresa la marca y el modelo.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="year">Año</label>
                <input id="year" class="form-control" type="number" [(ngModel)]="newVehicle.year" name="year" min="1990" max="2100" required />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="category">Categoría</label>
                <select id="category" class="form-select" [(ngModel)]="newVehicle.category" name="category">
                  @for (category of categories; track category) { <option [value]="category">{{ category }}</option> }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="fuel">Combustible</label>
                <select id="fuel" class="form-select" [(ngModel)]="newVehicle.fuel" name="fuel">
                  @for (fuel of fuels; track fuel) { <option [value]="fuel">{{ fuel }}</option> }
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="transmission">Transmisión</label>
                <input id="transmission" class="form-control" [(ngModel)]="newVehicle.transmission" name="transmission" placeholder="Automática" />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="engine">Motor</label>
                <input id="engine" class="form-control" [(ngModel)]="newVehicle.engine" name="engine" placeholder="2.0L" />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="price">Precio (USD)</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input id="price" class="form-control" type="number" [(ngModel)]="newVehicle.price" name="price" #price="ngModel" min="0.01" step="0.01" required
                         [class.is-invalid]="price.invalid && (price.touched || vehicleForm.submitted)" />
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="stock">Stock físico</label>
                <input id="stock" class="form-control" type="number" [(ngModel)]="newVehicle.stock" name="stock" min="0" required />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="lot">Lote</label>
                <input id="lot" class="form-control" [(ngModel)]="newVehicle.lot" name="lot" placeholder="SL-01" />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="location">Ubicación</label>
                <input id="location" class="form-control" [(ngModel)]="newVehicle.location" name="location" placeholder="Patio Central - A-04" />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="imageUrl">URL de imagen <span class="text-secondary fw-normal">(opcional)</span></label>
                <input id="imageUrl" class="form-control" type="url" [(ngModel)]="newVehicle.imageUrl" name="imageUrl" placeholder="https://..." />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="specifications">Especificaciones <span class="text-secondary fw-normal">(opcional)</span></label>
                <input id="specifications" class="form-control" [(ngModel)]="newVehicle.specifications" name="specifications" placeholder="2.0L · Blanco Perla" />
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-primary" type="submit" [disabled]="saving()"><i class="bi bi-check2 me-1"></i> Guardar vehículo</button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-alert [feedback]="feedback()" (closed)="feedback.set(null)" />

    <div class="card">
      <div class="card-header py-3">
        <div class="row g-2">
          <div class="col-md-8">
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input class="form-control" type="search" placeholder="Buscar por VIN, modelo o ubicación..." [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select form-select-sm" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" name="statusFilter">
              <option value="">Estado: todos</option>
              @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
            </select>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>VIN</th><th>Marca / Modelo</th><th>Precio</th><th>Ubicación</th><th style="width: 100px">Stock</th><th style="width: 160px">Estado</th><th></th></tr></thead>
          <tbody>
            @for (vehicle of filteredVehicles(); track vehicle.vin) {
              <tr>
                <td><span class="badge text-bg-light border vin">{{ vehicle.vin }}</span></td>
                <td><div class="fw-semibold">{{ vehicle.makeModel }} {{ vehicle.year }}</div><small class="text-secondary">{{ vehicle.category }} · {{ vehicle.specifications }}</small></td>
                <td>{{ vehicle.price | currency:'USD':'symbol':'1.0-0' }}</td>
                <td><input class="form-control form-control-sm" [(ngModel)]="vehicle.location" [name]="'location-' + vehicle.vin" /></td>
                <td><input class="form-control form-control-sm" type="number" min="0" [(ngModel)]="vehicle.stock" [name]="'stock-' + vehicle.vin" /></td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="vehicle.status" [name]="'status-' + vehicle.vin">
                    @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
                  </select>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" type="button" (click)="updateInventory(vehicle)" title="Guardar cambios"><i class="bi bi-save"></i></button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="text-center text-secondary py-4">{{ loading() ? 'Cargando inventario...' : 'No hay vehículos que coincidan con los filtros.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-white small text-secondary">Mostrando <strong>{{ filteredVehicles().length }}</strong> vehículos · <strong>{{ totalStock() }}</strong> unidades en stock</div>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  readonly statuses = VEHICLE_STATUSES;
  readonly categories = ['SUV', 'Sedán', 'Pick-up', 'Hatchback', 'Van', 'Coupé'];
  readonly fuels = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP'];

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly feedback = signal<Feedback | null>(null);
  readonly search = signal('');
  readonly statusFilter = signal('');

  readonly totalStock = computed(() => this.vehicles().reduce((sum, vehicle) => sum + (Number(vehicle.stock) || 0), 0));
  readonly availableStock = computed(() => this.vehicles()
    .filter((vehicle) => vehicle.status === 'Disponible')
    .reduce((sum, vehicle) => sum + (Number(vehicle.stock) || 0), 0));
  readonly filteredVehicles = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.vehicles().filter((vehicle) =>
      (!query || `${vehicle.vin} ${vehicle.makeModel} ${vehicle.location ?? ''}`.toLowerCase().includes(query))
      && (!status || vehicle.status === status));
  });

  newVehicle: CreateVehicleRequest = this.emptyVehicle();

  ngOnInit(): void {
    this.loadVehicles();
  }

  countByStatus(status: string): number {
    return this.vehicles().filter((vehicle) => vehicle.status === status).length;
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.service.getVehicles().subscribe({
      next: (vehicles) => { this.vehicles.set(vehicles); this.loading.set(false); },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.loading.set(false); },
    });
  }

  updateInventory(vehicle: Vehicle): void {
    const stock = Number(vehicle.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      this.feedback.set({ type: 'warning', text: 'El stock debe ser un número entero mayor o igual a 0.' });
      return;
    }
    this.service.updateInventory(vehicle.vin, {
      status: vehicle.status ?? 'Disponible',
      location: vehicle.location?.trim() || 'Sin ubicación',
      stock,
    }).subscribe({
      next: (updated) => {
        this.vehicles.update((list) => list.map((item) => (item.vin === updated.vin ? updated : item)));
        this.feedback.set({ type: 'success', text: `Inventario de ${updated.makeModel} actualizado.` });
      },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  createVehicle(form: NgForm): void {
    if (form.invalid) {
      this.feedback.set({ type: 'warning', text: 'Revisa los campos obligatorios del vehículo.' });
      return;
    }
    this.saving.set(true);
    this.service.createVehicle({ ...this.newVehicle, vin: this.newVehicle.vin.trim().toUpperCase(), status: 'Disponible' }).subscribe({
      next: (vehicle) => {
        this.feedback.set({ type: 'success', text: `Vehículo ${vehicle.makeModel} registrado correctamente.` });
        this.newVehicle = this.emptyVehicle();
        form.resetForm(this.newVehicle);
        this.showForm.set(false);
        this.saving.set(false);
        this.loadVehicles();
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.saving.set(false); },
    });
  }

  private emptyVehicle(): CreateVehicleRequest {
    return {
      vin: '', makeModel: '', year: new Date().getFullYear(), category: 'SUV', fuel: 'Gasolina',
      transmission: 'Automática', engine: '', price: 0, stock: 1, lot: '', location: '', imageUrl: '', specifications: '',
    };
  }
}
