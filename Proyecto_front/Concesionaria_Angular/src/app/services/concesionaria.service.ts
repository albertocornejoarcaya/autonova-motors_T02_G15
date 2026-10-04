import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Client, CreateClientRequest } from '../models/client.model';
import { CreateReservationRequest, Reservation, UpdateReservationDateRequest } from '../models/reservation.model';
import { CreateSaleRequest, Sale } from '../models/sale.model';
import { CreateStaffUserRequest, StaffUser, UpdateStaffUserRequest } from '../models/user.model';
import { CreateVehicleRequest, Vehicle, VehicleInventoryUpdate } from '../models/vehicle.model';

/**
 * Cliente HTTP de la API REST de Spring Boot.
 * Todas las peticiones viajan con la cookie de sesión (ver auth.interceptor.ts).
 */
@Injectable({ providedIn: 'root' })
export class ConcesionariaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  // Vehículos
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`).pipe(catchError(toFriendlyError));
  }

  getVehicle(vin: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${encodeURIComponent(vin)}`).pipe(catchError(toFriendlyError));
  }

  createVehicle(payload: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, payload).pipe(catchError(toFriendlyError));
  }

  updateInventory(vin: string, payload: VehicleInventoryUpdate): Observable<Vehicle> {
    return this.http
      .put<Vehicle>(`${this.apiUrl}/vehicles/${encodeURIComponent(vin)}/inventory`, payload)
      .pipe(catchError(toFriendlyError));
  }

  // Clientes
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`).pipe(catchError(toFriendlyError));
  }

  createClient(payload: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, payload).pipe(catchError(toFriendlyError));
  }

  // Usuarios
  getUsers(): Observable<StaffUser[]> {
    return this.http.get<StaffUser[]>(`${this.apiUrl}/users`).pipe(catchError(toFriendlyError));
  }

  createUser(payload: CreateStaffUserRequest): Observable<StaffUser> {
    return this.http.post<StaffUser>(`${this.apiUrl}/users`, payload).pipe(catchError(toFriendlyError));
  }

  updateUser(id: number, payload: UpdateStaffUserRequest): Observable<StaffUser> {
    return this.http.put<StaffUser>(`${this.apiUrl}/users/${id}`, payload).pipe(catchError(toFriendlyError));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(catchError(toFriendlyError));
  }

  // Reservas
  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`).pipe(catchError(toFriendlyError));
  }

  createReservation(payload: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, payload).pipe(catchError(toFriendlyError));
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations/${id}/cancel`, {}).pipe(catchError(toFriendlyError));
  }

  updateReservationDate(id: number, payload: UpdateReservationDateRequest): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/reservations/${id}/date`, payload).pipe(catchError(toFriendlyError));
  }

  // Ventas
  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/sales`).pipe(catchError(toFriendlyError));
  }

  completeSale(payload: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/sales`, payload).pipe(catchError(toFriendlyError));
  }
}

/** Convierte la respuesta de error del backend en un Error con mensaje legible en español. */
export function toFriendlyError(error: unknown): Observable<never> {
  return throwError(() => new Error(friendlyMessage(error)));
}

export function friendlyMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : 'No se pudo completar la operación.';
  }
  const backendMessage = typeof error.error === 'object' && error.error ? error.error.message : null;
  if (backendMessage) {
    return backendMessage;
  }
  switch (error.status) {
    case 0:
    case 502:
    case 504:
      return 'No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose en el puerto 8081.';
    case 401:
      return 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 409:
      return 'La operación entra en conflicto con el estado actual de los datos.';
    default:
      return `Error ${error.status}: no se pudo completar la operación.`;
  }
}
