import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Client } from '../../models/client.model';
import { Vehicle } from '../../models/vehicle.model';

export interface ReservationFormPayload {
  vin: string;
  clientId: number | null;
  reservationDate: string;
  notifyCustomer: boolean;
  notes: string;
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card mb-3">
      <div class="card-body">
        <h2 class="card-title mb-3">Nueva reserva</h2>
        <form #reservationForm="ngForm" (ngSubmit)="submit(reservationForm)" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="vin">Vehículo disponible</label>
              <select
                id="vin"
                class="form-select"
                [ngModel]="form().vin"
                (ngModelChange)="form.set({ ...form(), vin: $event })"
                name="vin"
                #vinCtrl="ngModel"
                required
                [class.is-invalid]="vinCtrl.invalid && (vinCtrl.touched || reservationForm.submitted)"
              >
                <option value="" disabled>Selecciona un vehículo</option>
                @for (vehicle of vehicles(); track vehicle.vin) {
                  <option [value]="vehicle.vin">
                    {{ vehicle.makeModel }} {{ vehicle.year }} · {{ vehicle.vin }} ({{ vehicle.stock }} en stock)
                  </option>
                }
              </select>
              <div class="invalid-feedback">Selecciona un vehículo disponible.</div>
            </div>

            <div class="col-md-6">
              <label class="form-label" for="clientId">Cliente</label>
              <select
                id="clientId"
                class="form-select"
                [ngModel]="form().clientId"
                (ngModelChange)="form.set({ ...form(), clientId: $event })"
                name="clientId"
                #clientCtrl="ngModel"
                required
                [class.is-invalid]="clientCtrl.invalid && (clientCtrl.touched || reservationForm.submitted)"
              >
                <option [ngValue]="null" disabled>Selecciona un cliente</option>
                @for (client of clients(); track client.id) {
                  <option [ngValue]="client.id">
                    {{ client.firstName }} {{ client.lastName }} · DNI {{ client.dni }}
                  </option>
                }
              </select>
              <div class="form-text">¿No aparece? <a routerLink="/clients">Registra al cliente</a> primero.</div>
            </div>

            <div class="col-md-4">
              <label class="form-label" for="reservationDate">Fecha de reserva</label>
              <input
                id="reservationDate"
                class="form-control"
                type="date"
                [min]="today()"
                [ngModel]="form().reservationDate"
                (ngModelChange)="form.set({ ...form(), reservationDate: $event })"
                name="reservationDate"
                required
              />
            </div>

            <div class="col-md-8">
              <label class="form-label" for="notes">Observaciones</label>
              <input
                id="notes"
                class="form-control"
                [ngModel]="form().notes"
                (ngModelChange)="form.set({ ...form(), notes: $event })"
                name="notes"
                maxlength="1000"
                placeholder="Ej.: prueba de manejo el sábado"
              />
            </div>

            <div class="col-12">
              <div class="form-check form-switch">
                <input
                  id="notify"
                  class="form-check-input"
                  type="checkbox"
                  [ngModel]="form().notifyCustomer"
                  (ngModelChange)="form.set({ ...form(), notifyCustomer: $event })"
                  name="notifyCustomer"
                />
                <label class="form-check-label small" for="notify">Notificar al cliente</label>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary" type="submit" [disabled]="saving()">
              <i class="bi bi-calendar-check me-1"></i> Crear reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ReservationFormComponent {
  readonly vehicles = input<Vehicle[]>([]);
  readonly clients = input<Client[]>([]);
  readonly saving = input(false);
  readonly today = input<string>('');
  readonly initialVin = input<string | null>(null);

  readonly submitReservation = output<ReservationFormPayload>();
  readonly closeForm = output<void>();

  readonly form = signal<ReservationFormPayload>({
    vin: '',
    clientId: null,
    reservationDate: '',
    notifyCustomer: true,
    notes: '',
  });

  private readonly hasAppliedInitialVin = signal(false);

  constructor() {
    effect(() => {
      const initialVin = this.initialVin();
      if (initialVin && !this.hasAppliedInitialVin()) {
        this.form.set({ ...this.form(), vin: initialVin });
        this.hasAppliedInitialVin.set(true);
      }
    });

    effect(() => {
      const today = this.today();
      if (!this.form().reservationDate && today) {
        this.form.set({ ...this.form(), reservationDate: today });
      }
    });
  }

  submit(ngForm: NgForm): void {
    if (ngForm.invalid || this.form().clientId === null) {
      ngForm.form.markAllAsTouched();
      return;
    }

    this.submitReservation.emit({
      vin: this.form().vin,
      clientId: this.form().clientId,
      reservationDate: this.form().reservationDate,
      notifyCustomer: this.form().notifyCustomer,
      notes: this.form().notes.trim() || '',
    });
  }
}
