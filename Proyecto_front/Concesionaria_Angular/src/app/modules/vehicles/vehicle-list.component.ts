import { Component } from '@angular/core';
import { VehicleCatalogComponent } from '../../components/shared/vehicle-catalog.component';

/** Catálogo interno para el personal (Administrador / Jefe de Almacén). */
@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [VehicleCatalogComponent],
  template: `<app-vehicle-catalog heading="Catálogo de Vehículos" subtitle="Inventario físico en sala de exhibición y patio central." />`,
})
export class VehicleListComponent {}
