export interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  roleId: number;
  roleName: string;
  status: string;
}

export interface CreateStaffUserRequest {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  roleId: number;
  active: boolean;
}

export interface UpdateStaffUserRequest {
  firstName: string;
  lastName: string;
  roleId: number;
  active: boolean;
}
