/** A service offered by a tenant (shelter). */
export interface ProcedureResponseDTO {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProcedureDTO {
  tenantId: string;
  name: string;
  description: string;
  durationMinutes: number;
  isActive?: boolean;
}

export interface UpdateProcedureDTO {
  name?: string;
  description?: string;
  durationMinutes?: number;
  isActive?: boolean;
}