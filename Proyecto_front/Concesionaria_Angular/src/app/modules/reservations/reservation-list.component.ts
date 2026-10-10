import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Client } from '../../models/client.model';
import { Reservation } from '../../models/reservation.model';
import { Vehicle } from '../../models/vehicle.model';
import { ConcesionariaService } from '../../services/concesionaria.service';
import { AlertComponent, Feedback } from '../../components/shared/alert.component';
import { localToday } from '../../shared/dates';
import { ReservationFormComponent, ReservationFormPayload } from './reservation-form.component';
import { ReservationSaleComponent } from './reservation-sale.component';
import { ReservationTableComponent } from './reservation-table.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [AlertComponent, ReservationFormComponent, ReservationSaleComponent, ReservationTableComponent],
  template: `
    <section class="page-header">
      <div>
        <h1>Reservas</h1>
        <p>Registra reservas, reprograma, cancela o concreta la venta de cada operación.</p>
      </div>
      <button class="btn btn-primary" type="button" (click)="showForm.set(!showForm())">
        <i class="bi" [class.bi-plus-lg]="!showForm()" [class.bi-x-lg]="showForm()"></i>
        {{ showForm() ? 'Cerrar' : 'Nueva reserva' }}
      </button>
    </section>

    @if (showForm()) {
      <app-reservation-form
        [vehicles]="availableVehicles()"
        [clients]="clients()"
        [saving]="saving()"
        [today]="today"
        [initialVin]="vin()"
        (submitReservation)="createReservation($event)"
      />
    }

    @if (selectedForSale(); as reservation) {
      <app-reservation-sale
        [reservation]="reservation"
        [saving]="saving()"
        (confirmSale)="completeSale(reservation, $event)"
        (cancelSale)="selectedForSale.set(null)"
      />
    }

    <app-alert [feedback]="feedback()" (closed)="feedback.set(null)" />

    <app-reservation-table
      [reservations]="filteredReservations()"
      [loading]="loading()"
      [statusFilter]="statusFilter()"
      [statusOptions]="statusOptions"
      [editingDateId]="editingDateId()"
      [today]="today"
      (statusChange)="statusFilter.set($event)"
      (cancelReservation)="cancelReservation($event)"
      (startEditDate)="startEditDate($event)"
      (saveDate)="saveReservationDate($event.reservation, $event.reservationDate)"
      (cancelDateEdit)="editingDateId.set(null)"
      (startSale)="startSale($event)"
    />
  `,
})
export class ReservationListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  /** VIN recibido por query param (?vin=...) desde el catálogo. */
  readonly vin = input<string | null>(null);

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

  readonly availableVehicles = computed(() =>
    this.vehicles().filter((vehicle) => vehicle.status === 'Disponible' && vehicle.stock > 0),
  );

  readonly filteredReservations = computed(() => {
    const status = this.statusFilter();
    return this.reservations().filter((reservation) => !status || reservation.status === status);
  });

  ngOnInit(): void {
    const vin = this.vin();
    if (vin) {
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
      error: (err: Error) => {
        this.feedback.set({ type: 'danger', text: err.message });
        this.loading.set(false);
      },
    });
  }

  createReservation(payload: ReservationFormPayload): void {
    if (payload.clientId === null) {
      this.feedback.set({ type: 'warning', text: 'Selecciona el cliente antes de crear la reserva.' });
      return;
    }

    this.saving.set(true);
    this.service
      .createReservation({
        vin: payload.vin,
        clientId: payload.clientId,
        reservationDate: payload.reservationDate,
        notifyCustomer: payload.notifyCustomer,
        notes: payload.notes.trim() || undefined,
      })
      .subscribe({
        next: (reservation) => {
          this.feedback.set({
            type: 'success',
            text: `Reserva #${reservation.id} creada para ${reservation.makeModel}.`,
          });
          this.showForm.set(false);
          this.statusFilter.set('Pendiente');
          this.saving.set(false);
          this.loadAll();
        },
        error: (err: Error) => {
          this.feedback.set({ type: 'danger', text: err.message });
          this.saving.set(false);
        },
      });
  }

  cancelReservation(reservation: Reservation): void {
    if (!confirm(`¿Cancelar la reserva #${reservation.id} de ${reservation.makeModel}? La unidad volverá al inventario.`)) {
      return;
    }

    this.service.cancelReservation(reservation.id).subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          text: `Reserva #${reservation.id} cancelada; la unidad volvió al stock.`,
        });
        this.loadAll();
      },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  startEditDate(reservation: Reservation): void {
    this.editingDateId.set(reservation.id);
  }

  saveReservationDate(reservation: Reservation, reservationDate: string): void {
    if (!reservationDate) {
      return;
    }

    this.service.updateReservationDate(reservation.id, { reservationDate }).subscribe({
      next: () => {
        this.editingDateId.set(null);
        this.feedback.set({ type: 'success', text: `Reserva #${reservation.id} reprogramada.` });
        this.loadAll();
      },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  startSale(reservation: Reservation): void {
    this.selectedForSale.set(reservation);
  }

  completeSale(reservation: Reservation, finalAmount: number): void {
    if (!(finalAmount > 0)) {
      this.feedback.set({ type: 'warning', text: 'El importe final debe ser mayor a 0.' });
      return;
    }

    this.saving.set(true);
    this.service.completeSale({ reservationId: reservation.id, finalAmount }).subscribe({
      next: (sale) => {
        this.feedback.set({
          type: 'success',
          text: `Venta #${sale.id} registrada. La reserva #${reservation.id} quedó Concretada.`,
        });
        this.selectedForSale.set(null);
        this.saving.set(false);
        this.loadAll();
      },
      error: (err: Error) => {
        this.feedback.set({ type: 'danger', text: err.message });
        this.saving.set(false);
      },
    });
  }
}
