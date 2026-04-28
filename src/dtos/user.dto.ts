export type UserRole = "super_admin" | "shelter_admin" | "citizen";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  tenantId?: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}