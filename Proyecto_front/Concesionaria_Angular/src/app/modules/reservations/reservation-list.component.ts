import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Client } from '../../models/client.model';
import { Reservation } from '../../models/reservation.model';
import { Vehicle } from '../../models/vehicle.model';
import { ConcesionariaService } from '../../services/concesionaria.service';
import { AlertComponent, Feedback } from '../../components/shared/alert.component';
import { localToday } from '../../shared/dates';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe, RouterLink, AlertComponent],
  template: `
    <section class="page-header">
      <div><h1>Reservas</h1><p>Registra reservas, reprograma, cancela o concreta la venta de cada operación.</p></div>
      <button class="btn btn-primary" type="button" (click)="showForm.set(!showForm())">
        <i class="bi" [class.bi-plus-lg]="!showForm()" [class.bi-x-lg]="showForm()"></i> {{ showForm() ? 'Cerrar' : 'Nueva reserva' }}
      </button>
    </section>

    @if (showForm()) {
      <div class="card mb-3">
        <div class="card-body">
          <h2 class="card-title mb-3">Nueva reserva</h2>
          <form #reservationForm="ngForm" (ngSubmit)="createReservation(reservationForm)" novalidate>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="vin">Vehículo disponible</label>
                <select id="vin" class="form-select" [(ngModel)]="form.vin" name="vin" #vinCtrl="ngModel" required
                        [class.is-invalid]="vinCtrl.invalid && (vinCtrl.touched || reservationForm.submitted)">
                  <option value="" disabled>Selecciona un vehículo</option>
                  @for (vehicle of availableVehicles(); track vehicle.vin) {
                    <option [value]="vehicle.vin">{{ vehicle.makeModel }} {{ vehicle.year }} · {{ vehicle.vin }} ({{ vehicle.stock }} en stock)</option>
                  }
                </select>
                <div class="invalid-feedback">Selecciona un vehículo disponible.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label" for="clientId">Cliente</label>
                <select id="clientId" class="form-select" [(ngModel)]="form.clientId" name="clientId" #clientCtrl="ngModel" required
                        [class.is-invalid]="clientCtrl.invalid && (clientCtrl.touched || reservationForm.submitted)">
                  <option [ngValue]="null" disabled>Selecciona un cliente</option>
                  @for (client of clients(); track client.id) {
                    <option [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }} · DNI {{ client.dni }}</option>
                  }
                </select>
                <div class="form-text">¿No aparece? <a routerLink="/clients">Registra al cliente</a> primero.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="reservationDate">Fecha de reserva</label>
                <input id="reservationDate" class="form-control" type="date" [min]="today" [(ngModel)]="form.reservationDate" name="reservationDate" required />
              </div>
              <div class="col-md-8">
                <label class="form-label" for="notes">Observaciones</label>
                <input id="notes" class="form-control" [(ngModel)]="form.notes" name="notes" maxlength="1000" placeholder="Ej.: prueba de manejo el sábado" />
              </div>
              <div class="col-12">
                <div class="form-check form-switch">
                  <input id="notify" class="form-check-input" type="checkbox" [(ngModel)]="form.notifyCustomer" name="notifyCustomer" />
                  <label class="form-check-label small" for="notify">Notificar al cliente</label>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-primary" type="submit" [disabled]="saving()"><i class="bi bi-calendar-check me-1"></i> Crear reserva</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (selectedForSale(); as reservation) {
      <div class="card border-success mb-3">
        <div class="card-body">
          <h2 class="card-title mb-1">Concretar venta · Reserva #{{ reservation.id }}</h2>
          <p class="small text-secondary mb-3">{{ reservation.makeModel }} para {{ reservation.clientName || ('Cliente #' + reservation.clientId) }} · Precio de lista {{ reservation.vehiclePrice | currency:'USD':'symbol':'1.0-0' }}</p>
          <div class="row g-2 align-items-end">
            <div class="col-sm-6 col-md-4">
              <label class="form-label" for="finalAmount">Importe final (USD)</label>
              <div class="input-group"><span class="input-group-text">$</span>
                <input id="finalAmount" class="form-control" type="number" min="0.01" step="0.01" [(ngModel)]="finalAmount" name="finalAmount" />
              </div>
            </div>
            <div class="col-auto"><button class="btn btn-success" type="button" (click)="completeSale(reservation)" [disabled]="saving()"><i class="bi bi-check2-circle me-1"></i> Confirmar venta</button></div>
            <div class="col-auto"><button class="btn btn-outline-secondary" type="button" (click)="selectedForSale.set(null)">Cancelar</button></div>
          </div>
        </div>
      </div>
    }

    <app-alert [feedback]="feedback()" (closed)="feedback.set(null)" />

    <div class="card">
      <div class="card-header py-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <ul class="nav nav-pills small">
          @for (option of statusOptions; track option) {
            <li class="nav-item">
              <button class="nav-link py-1 px-3" type="button" [class.active]="statusFilter() === option" (click)="statusFilter.set(option)">
                {{ option || 'Todas' }}
              </button>
            </li>
          }
        </ul>
        <span class="small text-secondary">{{ filteredReservations().length }} reserva(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>#</th><th>Cliente</th><th>Vehículo</th><th>Fecha</th><th>Estado</th><th>Asesor</th><th>Observaciones</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            @for (reservation of filteredReservations(); track reservation.id) {
              <tr>
                <td class="text-secondary">{{ reservation.id }}</td>
                <td class="fw-semibold">{{ reservation.clientName || ('Cliente #' + reservation.clientId) }}</td>
                <td><div>{{ reservation.makeModel }}</div><small class="text-secondary vin">{{ reservation.vin }}</small></td>
                <td>
                  @if (editingDateId() === reservation.id) {
                    <div class="input-group input-group-sm" style="min-width: 210px">
                      <input class="form-control" type="date" [min]="today" [(ngModel)]="newDate" name="newDate" />
                      <button class="btn btn-primary" type="button" (click)="saveDate(reservation)" title="Guardar"><i class="bi bi-check2"></i></button>
                      <button class="btn btn-outline-secondary" type="button" (click)="editingDateId.set(null)" title="Cancelar"><i class="bi bi-x"></i></button>
                    </div>
                  } @else {
                    {{ reservation.reservationDate | date:'dd/MM/yyyy' }}
                  }
                </td>
                <td><span class="badge" [class]="'badge ' + statusBadge(reservation.status)">{{ reservation.status }}</span></td>
                <td class="small">{{ reservation.userName || '—' }}</td>
                <td class="small">{{ reservation.notes || '—' }}</td>
                <td class="text-end text-nowrap">
                  @if (reservation.status === 'Pendiente') {
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-success" type="button" (click)="startSale(reservation)" title="Concretar venta"><i class="bi bi-bag-check"></i></button>
                      <button class="btn btn-outline-primary" type="button" (click)="startEditDate(reservation)" title="Reprogramar fecha"><i class="bi bi-calendar2-week"></i></button>
                      <button class="btn btn-outline-danger" type="button" (click)="cancelReservation(reservation)" title="Cancelar reserva"><i class="bi bi-x-circle"></i></button>
                    </div>
                  } @else {
                    <span class="text-secondary small">Sin acciones</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="text-center text-secondary py-4">{{ loading() ? 'Cargando reservas...' : 'No hay reservas para este filtro.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ReservationListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  /** VIN recibido por query param (?vin=...) desde el catálogo. */
  readonly vin = input<string>();

  readonly today = localToday();
  readonly statusOptions = ['', 'Pendiente', 'Concretada', 'Cancelada'];

  readonly reservations = signal<Reservation[]>([]);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly feedback = signal<Feedback | null>(null);
  readonly statusFilter = signal('Pendiente');
  readonly editingDateId = signal<number | null>(null);
  readonly selectedForSale = signal<Reservation | null>(null);

  readonly availableVehicles = computed(() => this.vehicles().filter((vehicle) => vehicle.status === 'Disponible' && vehicle.stock > 0));
  readonly filteredReservations = computed(() => {
    const status = this.statusFilter();
    return this.reservations().filter((reservation) => !status || reservation.status === status);
  });

  form = this.emptyForm();
  newDate = '';
  finalAmount = 0;

  ngOnInit(): void {
    const vin = this.vin();
    if (vin) {
      this.form.vin = vin;
      this.showForm.set(true);
    }
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      reservations: this.service.getReservations(),
      vehicles: this.service.getVehicles(),
      clients: this.service.getClients(),
    }).subscribe({
      next: ({ reservations, vehicles, clients }) => {
        this.reservations.set(reservations);
        this.vehicles.set(vehicles);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.loading.set(false); },
    });
  }

  createReservation(ngForm: NgForm): void {
    if (ngForm.invalid || this.form.clientId === null) {
      this.feedback.set({ type: 'warning', text: 'Selecciona el vehículo, el cliente y la fecha de la reserva.' });
      return;
    }
    this.saving.set(true);
    this.service.createReservation({
      vin: this.form.vin,
      clientId: this.form.clientId,
      reservationDate: this.form.reservationDate,
      notifyCustomer: this.form.notifyCustomer,
      notes: this.form.notes.trim() || undefined,
    }).subscribe({
      next: (reservation) => {
        this.feedback.set({ type: 'success', text: `Reserva #${reservation.id} creada para ${reservation.makeModel}.` });
        this.form = this.emptyForm();
        ngForm.resetForm(this.form);
        this.showForm.set(false);
        this.statusFilter.set('Pendiente');
        this.saving.set(false);
        this.loadAll();
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.saving.set(false); },
    });
  }

  cancelReservation(reservation: Reservation): void {
    if (!confirm(`¿Cancelar la reserva #${reservation.id} de ${reservation.makeModel}? La unidad volverá al inventario.`)) {
      return;
    }
    this.service.cancelReservation(reservation.id).subscribe({
      next: () => { this.feedback.set({ type: 'success', text: `Reserva #${reservation.id} cancelada; la unidad volvió al stock.` }); this.loadAll(); },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  startEditDate(reservation: Reservation): void {
    this.newDate = reservation.reservationDate;
    this.editingDateId.set(reservation.id);
  }

  saveDate(reservation: Reservation): void {
    if (!this.newDate) {
      return;
    }
    this.service.updateReservationDate(reservation.id, { reservationDate: this.newDate }).subscribe({
      next: () => { this.editingDateId.set(null); this.feedback.set({ type: 'success', text: `Reserva #${reservation.id} reprogramada.` }); this.loadAll(); },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  startSale(reservation: Reservation): void {
    this.finalAmount = Number(reservation.vehiclePrice) || 0;
    this.selectedForSale.set(reservation);
  }

  completeSale(reservation: Reservation): void {
    if (!(this.finalAmount > 0)) {
      this.feedback.set({ type: 'warning', text: 'El importe final debe ser mayor a 0.' });
      return;
    }
    this.saving.set(true);
    this.service.completeSale({ reservationId: reservation.id, finalAmount: this.finalAmount }).subscribe({
      next: (sale) => {
        this.feedback.set({ type: 'success', text: `Venta #${sale.id} registrada. La reserva #${reservation.id} quedó Concretada.` });
        this.selectedForSale.set(null);
        this.saving.set(false);
        this.loadAll();
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.saving.set(false); },
    });
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'Pendiente': return 'text-bg-warning';
      case 'Concretada': return 'text-bg-success';
      case 'Cancelada': return 'text-bg-secondary';
      default: return 'text-bg-light';
    }
  }

  private emptyForm(): { vin: string; clientId: number | null; reservationDate: string; notifyCustomer: boolean; notes: string } {
    return { vin: '', clientId: null, reservationDate: localToday(), notifyCustomer: true, notes: '' };
  }
}
