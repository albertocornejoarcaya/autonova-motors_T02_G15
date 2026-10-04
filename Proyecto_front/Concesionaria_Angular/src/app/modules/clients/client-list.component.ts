import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Client, CreateClientRequest } from '../../models/client.model';
import { ConcesionariaService } from '../../services/concesionaria.service';
import { AlertComponent, Feedback } from '../../components/shared/alert.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [FormsModule, AlertComponent],
  template: `
    <section class="page-header">
      <div><h1>Clientes</h1><p>Consulta los clientes registrados o agrega uno nuevo.</p></div>
      <span class="badge text-bg-light border">{{ clients().length }} cliente(s)</span>
    </section>

    <div class="card mb-3">
      <div class="card-body">
        <h2 class="card-title mb-3"><i class="bi bi-person-plus me-1"></i> Registrar cliente</h2>
        <form #clientForm="ngForm" (ngSubmit)="createClient(clientForm)" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="firstName">Nombres</label>
              <input id="firstName" class="form-control" [(ngModel)]="newClient.firstName" name="firstName" #firstName="ngModel"
                     placeholder="Juan Carlos" required [class.is-invalid]="firstName.invalid && (firstName.touched || clientForm.submitted)" />
              <div class="invalid-feedback">Ingresa los nombres.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="lastName">Apellidos</label>
              <input id="lastName" class="form-control" [(ngModel)]="newClient.lastName" name="lastName" #lastName="ngModel"
                     placeholder="García López" required [class.is-invalid]="lastName.invalid && (lastName.touched || clientForm.submitted)" />
              <div class="invalid-feedback">Ingresa los apellidos.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="dni">DNI</label>
              <input id="dni" class="form-control" [(ngModel)]="newClient.dni" name="dni" #dni="ngModel" inputmode="numeric"
                     placeholder="12345678" maxlength="8" pattern="[0-9]{8}" required
                     [class.is-invalid]="dni.invalid && (dni.touched || clientForm.submitted)" />
              <div class="invalid-feedback">El DNI debe tener 8 dígitos.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="phone">Teléfono</label>
              <input id="phone" class="form-control" [(ngModel)]="newClient.phone" name="phone" #phone="ngModel" type="tel"
                     placeholder="+51 999 000 111" required [class.is-invalid]="phone.invalid && (phone.touched || clientForm.submitted)" />
              <div class="invalid-feedback">Ingresa un teléfono.</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="email">Correo electrónico</label>
              <input id="email" class="form-control" [(ngModel)]="newClient.email" name="email" #email="ngModel" type="email"
                     placeholder="juan@email.com" required email [class.is-invalid]="email.invalid && (email.touched || clientForm.submitted)" />
              <div class="invalid-feedback">Ingresa un correo válido.</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="address">Dirección <span class="text-secondary fw-normal">(opcional)</span></label>
              <input id="address" class="form-control" [(ngModel)]="newClient.address" name="address" placeholder="Av. Principal 123, Lima" />
            </div>
          </div>
          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary" type="submit" [disabled]="saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-1"></span> } @else { <i class="bi bi-person-check-fill me-1"></i> }
              Registrar cliente
            </button>
          </div>
        </form>
        <div class="mt-3"><app-alert [feedback]="feedback()" (closed)="feedback.set(null)" /></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
        <h2 class="card-title mb-0">Clientes registrados</h2>
        <div class="input-group input-group-sm" style="max-width: 320px">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input class="form-control" type="search" placeholder="Buscar por nombre, DNI o correo" [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>#</th><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Correo</th><th>Dirección</th></tr></thead>
          <tbody>
            @for (client of filteredClients(); track client.id) {
              <tr>
                <td class="text-secondary">{{ client.id }}</td>
                <td class="fw-semibold">{{ client.firstName }} {{ client.lastName }}</td>
                <td>{{ client.dni }}</td>
                <td>{{ client.phone }}</td>
                <td>{{ client.email }}</td>
                <td>{{ client.address || '—' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="text-center text-secondary py-4">{{ loading() ? 'Cargando clientes...' : 'No hay clientes para mostrar.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ClientListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly feedback = signal<Feedback | null>(null);
  readonly search = signal('');
  readonly filteredClients = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.clients().filter((client) =>
      !query || `${client.firstName} ${client.lastName} ${client.dni} ${client.email}`.toLowerCase().includes(query));
  });

  newClient: CreateClientRequest = this.emptyClient();

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.service.getClients().subscribe({
      next: (clients) => { this.clients.set(clients); this.loading.set(false); },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.loading.set(false); },
    });
  }

  createClient(form: NgForm): void {
    if (form.invalid) {
      this.feedback.set({ type: 'warning', text: 'Revisa los campos marcados en rojo.' });
      return;
    }
    this.saving.set(true);
    this.service.createClient({ ...this.newClient, email: this.newClient.email.trim() }).subscribe({
      next: (client) => {
        this.feedback.set({ type: 'success', text: `Cliente ${client.firstName} ${client.lastName} registrado (ID ${client.id}).` });
        this.newClient = this.emptyClient();
        form.resetForm(this.newClient);
        this.saving.set(false);
        this.loadClients();
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.saving.set(false); },
    });
  }

  private emptyClient(): CreateClientRequest {
    return { firstName: '', lastName: '', dni: '', phone: '', email: '', address: '' };
  }
}
