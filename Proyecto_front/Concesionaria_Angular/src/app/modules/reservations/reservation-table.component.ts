import { Component, input, output } from '@angular/core';
import { Reservation } from '../../models/reservation.model';
import { ReservationDateEditorComponent } from './reservation-date-editor.component';

@Component({
  selector: 'app-reservation-table',
  standalone: true,
  imports: [ReservationDateEditorComponent],
  template: `
    <div class="card">
      <div class="card-header py-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <ul class="nav nav-pills small">
          @for (option of statusOptions(); track option) {
            <li class="nav-item">
              <button
                class="nav-link py-1 px-3"
                type="button"
                [class.active]="statusFilter() === option"
                (click)="statusChange.emit(option)"
              >
                {{ option || 'Todas' }}
              </button>
            </li>
          }
        </ul>
        <span class="small text-secondary">{{ reservations().length }} reserva(s)</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Asesor</th>
              <th>Observaciones</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (reservation of reservations(); track reservation.id) {
              <tr>
                <td class="text-secondary">{{ reservation.id }}</td>
                <td class="fw-semibold">{{ reservation.clientName || ('Cliente #' + reservation.clientId) }}</td>
                <td>
                  <div>{{ reservation.makeModel }}</div>
                  <small class="text-secondary vin">{{ reservation.vin }}</small>
                </td>
                <td>
                  <app-reservation-date-editor
                    [reservation]="reservation"
                    [editing]="editingDateId() === reservation.id"
                    [today]="today()"
                    [currentDate]="reservation.reservationDate"
                    (saveDate)="saveDate.emit({ reservation, reservationDate: $event.reservationDate })"
                    (cancelEditDate)="cancelDateEdit.emit()"
                  />
                </td>
                <td>
                  <span class="badge" [class]="'badge ' + statusBadge(reservation.status)">{{ reservation.status }}</span>
                </td>
                <td class="small">{{ reservation.userName || '—' }}</td>
                <td class="small">{{ reservation.notes || '—' }}</td>
                <td class="text-end text-nowrap">
                  @if (reservation.status === 'Pendiente') {
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-success" type="button" (click)="startSale.emit(reservation)" title="Concretar venta">
                        <i class="bi bi-bag-check"></i>
                      </button>
                      <button class="btn btn-outline-primary" type="button" (click)="startEditDate.emit(reservation)" title="Reprogramar fecha">
                        <i class="bi bi-calendar2-week"></i>
                      </button>
                      <button class="btn btn-outline-danger" type="button" (click)="cancelReservation.emit(reservation)" title="Cancelar reserva">
                        <i class="bi bi-x-circle"></i>
                      </button>
                    </div>
                  } @else {
                    <span class="text-secondary small">Sin acciones</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="text-center text-secondary py-4">
                  {{ loading() ? 'Cargando reservas...' : 'No hay reservas para este filtro.' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ReservationTableComponent {
  readonly reservations = input<Reservation[]>([]);
  readonly loading = input(false);
  readonly statusFilter = input('Pendiente');
  readonly statusOptions = input<string[]>(['', 'Pendiente', 'Concretada', 'Cancelada']);
  readonly editingDateId = input<number | null>(null);
  readonly today = input<string>('');

  readonly statusChange = output<string>();
  readonly cancelReservation = output<Reservation>();
  readonly startEditDate = output<Reservation>();
  readonly saveDate = output<{ reservation: Reservation; reservationDate: string }>();
  readonly cancelDateEdit = output<void>();
  readonly startSale = output<Reservation>();

  statusBadge(status: string): string {
    switch (status) {
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Concretada':
        return 'text-bg-success';
      case 'Cancelada':
        return 'text-bg-secondary';
      default:
        return 'text-bg-light';
    }
  }
}
