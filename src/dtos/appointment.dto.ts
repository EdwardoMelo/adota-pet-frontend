export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface AppointmentResponseDTO {
  id: string;
  tenantId: string;
  userId: string;
  procedureId: string;
  userPetId: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentDTO {
  tenantId: string;
  userId: string;
  procedureId: string;
  userPetId?: string | null;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateAppointmentDTO {
  procedureId?: string;
  userPetId?: string | null;
  scheduledAt?: string;
  status?: AppointmentStatus;
  notes?: string;
}