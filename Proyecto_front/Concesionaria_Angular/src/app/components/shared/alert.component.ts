import { Component, input, output } from '@angular/core';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Feedback {
  type: AlertType;
  text: string;
}

/** Alerta Bootstrap reutilizable para mostrar el resultado de una operación. */
@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    @if (feedback(); as fb) {
      <div class="alert alert-dismissible d-flex align-items-center gap-2 py-2 small" [class]="'alert-' + fb.type" role="alert">
        <i class="bi" [class.bi-check-circle-fill]="fb.type === 'success'" [class.bi-exclamation-triangle-fill]="fb.type !== 'success'"></i>
        <span>{{ fb.text }}</span>
        <button type="button" class="btn-close" aria-label="Cerrar" (click)="closed.emit()"></button>
      </div>
    }
  `,
})
export class AlertComponent {
  readonly feedback = input<Feedback | null>(null);
  readonly closed = output<void>();
}
