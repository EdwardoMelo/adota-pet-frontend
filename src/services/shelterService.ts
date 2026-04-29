import { api, dispatchApiError } from "./apiClient";
import type { ShelterResponseDTO } from "@/dtos";

export const shelterService = {
  async getAll(filters?: {
    tenantId?: string;
    search?: string;
    city?: string;
    state?: string;
  }): Promise<ShelterResponseDTO[]> {
    try {
      const { data } = await api.get<ShelterResponseDTO[]>("/shelters", {
        params: filters,
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<ShelterResponseDTO | null> {
    try {
      const { data } = await api.get<ShelterResponseDTO | null>(`/shelters/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};

