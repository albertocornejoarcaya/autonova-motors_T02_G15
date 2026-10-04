export interface Reservation {
  id: number;
  vin: string;
  makeModel: string;
  clientId: number;
  userId?: number | null;
  reservationDate: string;
  notifyCustomer: boolean;
  vehiclePrice: number;
  reservedAt: string;
  status: string;
  notes?: string | null;
  clientName?: string | null;
  userName?: string | null;
}

export interface CreateReservationRequest {
  vin: string;
  clientId: number;
  reservationDate: string;
  notifyCustomer: boolean;
  notes?: string;
}

export interface UpdateReservationDateRequest {
  reservationDate: string;
}
