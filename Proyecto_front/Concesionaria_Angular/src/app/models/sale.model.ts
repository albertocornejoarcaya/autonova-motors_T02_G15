export interface Sale {
  id: number;
  reservationId: number;
  vin: string;
  makeModel: string;
  clientId: number;
  sellerId: number;
  completedAt: string;
  finalAmount: number;
  clientName?: string | null;
  sellerName?: string | null;
}

export interface CreateSaleRequest {
  reservationId: number;
  finalAmount: number;
}
