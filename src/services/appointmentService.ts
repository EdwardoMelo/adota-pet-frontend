import { api, dispatchApiError } from "./apiClient";
import type {
  AppointmentResponseDTO,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "@/dtos";

export const appointmentService = {
  async getAll(filter?: {
    tenantId?: string;
    userId?: string;
  }): Promise<AppointmentResponseDTO[]> {
    try {
      const { data } = await api.get<AppointmentResponseDTO[]>("/appointments", {
        params: filter,
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<AppointmentResponseDTO | null> {
    try {
      const { data } = await api.get<AppointmentResponseDTO | null>(`/appointments/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateAppointmentDTO): Promise<AppointmentResponseDTO> {
    try {
      const { data } = await api.post<AppointmentResponseDTO>("/appointments", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async createVisit(dto: {
    tenantId: string;
    userId: string;
    procedureId: string;
    petId: string;
    scheduledAt: string;
    notes?: string;
  }): Promise<AppointmentResponseDTO> {
    try {
      const { data } = await api.post<AppointmentResponseDTO>("/appointments/visit", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(
    id: string,
    dto: UpdateAppointmentDTO,
  ): Promise<AppointmentResponseDTO> {
    try {
      const { data } = await api.patch<AppointmentResponseDTO>(`/appointments/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};