import { CurrencyPipe } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-sale',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    @if (reservation(); as item) {
      <div class="card border-success mb-3">
        <div class="card-body">
          <h2 class="card-title mb-1">Concretar venta · Reserva #{{ item.id }}</h2>
          <p class="small text-secondary mb-3">
            {{ item.makeModel }} para {{ item.clientName || ('Cliente #' + item.clientId) }} · Precio de lista
            {{ item.vehiclePrice | currency: 'USD' : 'symbol' : '1.0-0' }}
          </p>
          <div class="row g-2 align-items-end">
            <div class="col-sm-6 col-md-4">
              <label class="form-label" for="finalAmount">Importe final (USD)</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  id="finalAmount"
                  class="form-control"
                  type="number"
                  min="0.01"
                  step="0.01"
                  [ngModel]="finalAmount()"
                  (ngModelChange)="finalAmount.set($event)"
                  name="finalAmount"
                />
              </div>
            </div>
            <div class="col-auto">
              <button class="btn btn-success" type="button" (click)="confirm()" [disabled]="saving()">
                <i class="bi bi-check2-circle me-1"></i> Confirmar venta
              </button>
            </div>
            <div class="col-auto">
              <button class="btn btn-outline-secondary" type="button" (click)="cancel()">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReservationSaleComponent {
  readonly reservation = input<Reservation | null>(null);
  readonly saving = input(false);

  readonly confirmSale = output<number>();
  readonly cancelSale = output<void>();

  readonly finalAmount = signal(0);

  constructor() {
    effect(() => {
      const item = this.reservation();
      if (item) {
        this.finalAmount.set(Number(item.vehiclePrice) || 0);
      }
    });
  }

  confirm(): void {
    this.confirmSale.emit(this.finalAmount());
  }

  cancel(): void {
    this.cancelSale.emit();
  }
}
