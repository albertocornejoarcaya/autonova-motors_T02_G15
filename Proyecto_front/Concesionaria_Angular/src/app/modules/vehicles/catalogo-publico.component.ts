import { Component } from '@angular/core';
import { VehicleCatalogComponent } from '../../components/shared/vehicle-catalog.component';

/** Catálogo público: accesible sin iniciar sesión. */
@Component({
  selector: 'app-catalogo-publico',
  standalone: true,
  imports: [VehicleCatalogComponent],
  template: `<app-vehicle-catalog heading="Catálogo de Vehículos" subtitle="Explora las unidades disponibles en AutoNova Motors." />`,
})
export class CatalogoPublicoComponent {}
