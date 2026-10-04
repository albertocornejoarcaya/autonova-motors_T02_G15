export interface Vehicle {
  vin: string;
  makeModel: string;
  year: number;
  category: string;
  lot?: string | null;
  status?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  engine?: string | null;
  price: number;
  imageUrl?: string | null;
  specifications?: string | null;
  location?: string | null;
  stock: number;
}

export interface VehicleInventoryUpdate {
  status: string;
  location: string;
  stock: number;
}

export interface CreateVehicleRequest {
  vin: string;
  makeModel: string;
  year: number;
  category: string;
  lot?: string;
  status?: string;
  fuel?: string;
  transmission?: string;
  engine?: string;
  price: number;
  imageUrl?: string;
  specifications?: string;
  location?: string;
  stock: number;
}
