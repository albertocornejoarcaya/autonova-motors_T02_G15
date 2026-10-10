import { DatePipe } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reservation } from '../../models/reservation.model';

export interface ReservationDateChange {
  reservationId: number;
  reservationDate: string;
}

@Component({
  selector: 'app-reservation-date-editor',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    @if (editing() && reservation(); as item) {
      <div class="input-group input-group-sm" style="min-width: 210px">
        <input
          class="form-control"
          type="date"
          [min]="today()"
          [ngModel]="newDate()"
          (ngModelChange)="newDate.set($event)"
          name="newDate"
        />
        <button class="btn btn-primary" type="button" (click)="save(item)" title="Guardar">
          <i class="bi bi-check2"></i>
        </button>
        <button class="btn btn-outline-secondary" type="button" (click)="cancel()" title="Cancelar">
          <i class="bi bi-x"></i>
        </button>
      </div>
    } @else {
      {{ reservation()?.reservationDate || '' | date: 'dd/MM/yyyy' }}
    }
  `,
})
export class ReservationDateEditorComponent {
  readonly reservation = input<Reservation | null>(null);
  readonly editing = input(false);
  readonly today = input<string>('');
  readonly currentDate = input<string>('');

  readonly saveDate = output<{ reservationId: number; reservationDate: string }>();
  readonly cancelEditDate = output<void>();

  readonly newDate = signal('');

  constructor() {
    effect(() => {
      if (this.editing()) {
        const nextDate = this.currentDate() || this.reservation()?.reservationDate || '';
        this.newDate.set(nextDate);
      }
    });
  }

  save(reservation: Reservation): void {
    const date = this.newDate();
    if (!date) {
      return;
    }

    this.saveDate.emit({
      reservationId: reservation.id,
      reservationDate: date,
    });
  }

  cancel(): void {
    this.cancelEditDate.emit();
  }
}
