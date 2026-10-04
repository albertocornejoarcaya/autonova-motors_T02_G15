import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateStaffUserRequest, StaffUser, UpdateStaffUserRequest } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ConcesionariaService } from '../../services/concesionaria.service';
import { AlertComponent, Feedback } from '../../components/shared/alert.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, AlertComponent],
  template: `
    <section class="page-header">
      <div><h1>Gestión de Usuarios y Permisos</h1><p>Control de usuarios del sistema y asignación de roles.</p></div>
      <button class="btn btn-primary" type="button" (click)="toggleCreate()">
        <i class="bi" [class.bi-person-plus-fill]="!showCreate()" [class.bi-x-lg]="showCreate()"></i> {{ showCreate() ? 'Cancelar' : 'Nuevo usuario' }}
      </button>
    </section>

    <div class="row g-3 mb-3">
      <div class="col-md-4"><div class="card h-100"><div class="card-body py-2"><div class="metric-label">USUARIOS REGISTRADOS</div><div class="metric-value">{{ users().length }}</div><small class="text-success fw-semibold">{{ activeCount() }} activos</small> <small class="text-secondary">· {{ users().length - activeCount() }} inactivos</small></div></div></div>
      <div class="col-md-8"><div class="card h-100"><div class="card-body py-2"><div class="metric-label mb-2">ROLES DEL SISTEMA</div>
        @for (role of roles; track role.id) { <span class="badge text-bg-light border me-1 mb-1">{{ role.name }}: {{ countByRole(role.id) }}</span> }
        <div class="small text-secondary mt-1">Administrador: todo · Asesor: clientes, reservas y ventas · Jefe de Almacén: catálogo e inventario</div>
      </div></div></div>
    </div>

    @if (showCreate()) {
      <div class="card mb-3">
        <div class="card-body">
          <h2 class="card-title mb-3">Registrar nuevo usuario</h2>
          <form #userForm="ngForm" (ngSubmit)="createUser(userForm)" novalidate>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label" for="firstName">Nombres</label>
                <input id="firstName" class="form-control" [(ngModel)]="newUser.firstName" name="firstName" #fn="ngModel" required [class.is-invalid]="fn.invalid && (fn.touched || userForm.submitted)" />
              </div>
              <div class="col-md-4">
                <label class="form-label" for="lastName">Apellidos</label>
                <input id="lastName" class="form-control" [(ngModel)]="newUser.lastName" name="lastName" #ln="ngModel" required [class.is-invalid]="ln.invalid && (ln.touched || userForm.submitted)" />
              </div>
              <div class="col-md-4">
                <label class="form-label" for="dni">DNI</label>
                <input id="dni" class="form-control" [(ngModel)]="newUser.dni" name="dni" #dni="ngModel" maxlength="8" pattern="[0-9]{8}" inputmode="numeric" required [class.is-invalid]="dni.invalid && (dni.touched || userForm.submitted)" />
                <div class="invalid-feedback">8 dígitos.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="email">Correo institucional</label>
                <input id="email" class="form-control" type="email" [(ngModel)]="newUser.email" name="email" #em="ngModel" required email [class.is-invalid]="em.invalid && (em.touched || userForm.submitted)" />
              </div>
              <div class="col-md-4">
                <label class="form-label" for="password">Contraseña</label>
                <input id="password" class="form-control" type="password" [(ngModel)]="newUser.password" name="password" #pw="ngModel" autocomplete="new-password"
                       required [pattern]="passwordPattern" [class.is-invalid]="pw.invalid && (pw.touched || userForm.submitted)" />
                <div class="form-text">Mínimo 8 caracteres, una mayúscula y un número.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="roleId">Rol asignado</label>
                <select id="roleId" class="form-select" [(ngModel)]="newUser.roleId" name="roleId">
                  @for (role of roles; track role.id) { <option [ngValue]="role.id">{{ role.name }}</option> }
                </select>
              </div>
              <div class="col-12">
                <div class="form-check form-switch">
                  <input id="active" class="form-check-input" type="checkbox" [(ngModel)]="newUser.active" name="active" />
                  <label class="form-check-label small" for="active">Usuario activo</label>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3"><button class="btn btn-primary" type="submit" [disabled]="saving()"><i class="bi bi-check2 me-1"></i> Guardar usuario</button></div>
          </form>
        </div>
      </div>
    }

    <app-alert [feedback]="feedback()" (closed)="feedback.set(null)" />

    <div class="card">
      <div class="card-header py-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div class="input-group input-group-sm" style="max-width: 360px">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input class="form-control" type="search" placeholder="Buscar por nombre o correo..." [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
        </div>
        <small class="text-secondary">Mostrando <strong>{{ filteredUsers().length }}</strong> usuarios</small>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>Usuario</th><th>Correo</th><th>DNI</th><th style="width: 190px">Rol</th><th style="width: 120px">Estado</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            @for (user of filteredUsers(); track user.id) {
              <tr>
                <td>
                  @if (editingId() === user.id) {
                    <div class="d-flex gap-1">
                      <input class="form-control form-control-sm" [(ngModel)]="edit.firstName" name="editFirstName" placeholder="Nombres" />
                      <input class="form-control form-control-sm" [(ngModel)]="edit.lastName" name="editLastName" placeholder="Apellidos" />
                    </div>
                  } @else {
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge text-bg-dark">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
                      <div><div class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</div><small class="text-secondary">ID #{{ user.id }}</small></div>
                    </div>
                  }
                </td>
                <td><code>{{ user.email }}</code></td>
                <td>{{ user.dni }}</td>
                <td>
                  @if (editingId() === user.id) {
                    <select class="form-select form-select-sm" [(ngModel)]="edit.roleId" name="editRole">
                      @for (role of roles; track role.id) { <option [ngValue]="role.id">{{ role.name }}</option> }
                    </select>
                  } @else {
                    <span class="badge text-bg-primary bg-opacity-75">{{ user.roleName }}</span>
                  }
                </td>
                <td>
                  @if (editingId() === user.id) {
                    <div class="form-check form-switch mb-0"><input class="form-check-input" type="checkbox" [(ngModel)]="edit.active" name="editActive" /></div>
                  } @else {
                    <span class="badge" [class.text-bg-success]="user.status === 'Activo'" [class.text-bg-secondary]="user.status !== 'Activo'">{{ user.status }}</span>
                  }
                </td>
                <td class="text-end text-nowrap">
                  @if (editingId() === user.id) {
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-primary" type="button" (click)="saveEdit(user)" title="Guardar"><i class="bi bi-check2"></i></button>
                      <button class="btn btn-outline-secondary" type="button" (click)="editingId.set(null)" title="Cancelar"><i class="bi bi-x"></i></button>
                    </div>
                  } @else {
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" type="button" (click)="startEdit(user)" title="Editar"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-outline-danger" type="button" (click)="deleteUser(user)" [disabled]="user.id === currentUserId()" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </div>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="text-center text-secondary py-4">{{ loading() ? 'Cargando usuarios...' : 'No hay usuarios para mostrar.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private readonly service = inject(ConcesionariaService);
  private readonly auth = inject(AuthService);

  readonly roles = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Asesor de Ventas' },
    { id: 3, name: 'Jefe de Almacén' },
  ];
  readonly passwordPattern = '(?=.*[A-Z])(?=.*[0-9]).{8,}';

  readonly users = signal<StaffUser[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showCreate = signal(false);
  readonly feedback = signal<Feedback | null>(null);
  readonly search = signal('');
  readonly editingId = signal<number | null>(null);
  readonly currentUserId = computed(() => this.auth.user()?.userId ?? null);

  readonly activeCount = computed(() => this.users().filter((user) => user.status === 'Activo').length);
  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.users().filter((user) => `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(query));
  });

  newUser: CreateStaffUserRequest = this.emptyUser();
  edit: UpdateStaffUserRequest = { firstName: '', lastName: '', roleId: 2, active: true };

  ngOnInit(): void {
    this.loadUsers();
  }

  countByRole(roleId: number): number {
    return this.users().filter((user) => user.roleId === roleId).length;
  }

  toggleCreate(): void {
    this.showCreate.set(!this.showCreate());
  }

  loadUsers(): void {
    this.loading.set(true);
    this.service.getUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.loading.set(false); },
    });
  }

  createUser(form: NgForm): void {
    if (form.invalid) {
      this.feedback.set({ type: 'warning', text: 'Revisa los campos marcados: DNI de 8 dígitos y contraseña segura.' });
      return;
    }
    this.saving.set(true);
    this.service.createUser({ ...this.newUser, email: this.newUser.email.trim() }).subscribe({
      next: (user) => {
        this.feedback.set({ type: 'success', text: `Usuario ${user.email} creado como ${user.roleName}.` });
        this.newUser = this.emptyUser();
        form.resetForm(this.newUser);
        this.showCreate.set(false);
        this.saving.set(false);
        this.loadUsers();
      },
      error: (err: Error) => { this.feedback.set({ type: 'danger', text: err.message }); this.saving.set(false); },
    });
  }

  startEdit(user: StaffUser): void {
    this.edit = { firstName: user.firstName, lastName: user.lastName, roleId: user.roleId, active: user.status === 'Activo' };
    this.editingId.set(user.id);
  }

  saveEdit(user: StaffUser): void {
    if (!this.edit.firstName.trim() || !this.edit.lastName.trim()) {
      this.feedback.set({ type: 'warning', text: 'Nombres y apellidos son obligatorios.' });
      return;
    }
    this.service.updateUser(user.id, this.edit).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        this.editingId.set(null);
        this.feedback.set({ type: 'success', text: `Usuario ${updated.email} actualizado.` });
      },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  deleteUser(user: StaffUser): void {
    if (!confirm(`¿Eliminar al usuario ${user.firstName} ${user.lastName}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.service.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((item) => item.id !== user.id));
        this.feedback.set({ type: 'success', text: `Usuario ${user.email} eliminado.` });
      },
      error: (err: Error) => this.feedback.set({ type: 'danger', text: err.message }),
    });
  }

  private emptyUser(): CreateStaffUserRequest {
    return { firstName: '', lastName: '', dni: '', email: '', password: '', roleId: 2, active: true };
  }
}
