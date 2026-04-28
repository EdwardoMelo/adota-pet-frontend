export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface TenantResponseDTO {
  id: string;
  name: string;
  city: string;
  subscriptionStatus: SubscriptionStatus;
  stripeAccountId?: string;
  createdAt: string;
}

export interface CreateTenantDTO {
  name: string;
  city: string;
  subscriptionStatus?: SubscriptionStatus;
  stripeAccountId?: string;
}

export interface UpdateTenantDTO {
  name?: string;
  city?: string;
  subscriptionStatus?: SubscriptionStatus;
  stripeAccountId?: string;
}