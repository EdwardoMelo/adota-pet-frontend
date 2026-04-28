export type AdoptionStatus = "pending" | "completed" | "cancelled";

export interface AdoptionResponseDTO {
  id: string;
  tenantId: string;
  petId: string;
  userId: string;
  status: AdoptionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdoptionDTO {
  tenantId: string;
  petId: string;
  userId: string;
  notes?: string;
}

export interface UpdateAdoptionDTO {
  status?: AdoptionStatus;
  notes?: string;
}
