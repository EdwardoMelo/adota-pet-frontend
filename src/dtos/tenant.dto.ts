export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";
export interface ShelterAddressDTO {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  number: string;
  apartment?: string | null;
}

export interface TenantResponseDTO {
  id: string;
  name: string;
  address: ShelterAddressDTO;
  subscriptionStatus: SubscriptionStatus;
  stripeAccountId?: string;
  createdAt: string;
}

export interface CreateTenantDTO {
  name: string;
  address: ShelterAddressDTO;
  subscriptionStatus?: SubscriptionStatus;
  stripeAccountId?: string;
}

export interface UpdateTenantDTO {
  name?: string;
  address?: ShelterAddressDTO;
  subscriptionStatus?: SubscriptionStatus;
  stripeAccountId?: string;
}