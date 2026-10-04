export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  address?: string | null;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  address?: string;
}
