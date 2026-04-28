import { api, dispatchApiError } from "./apiClient";
import type {
  AdoptionResponseDTO,
  CreateAdoptionDTO,
  UpdateAdoptionDTO,
} from "@/dtos";

export const adoptionService = {
  async getAll(filter?: {
    tenantId?: string;
    userId?: string;
    petId?: string;
    status?: AdoptionResponseDTO["status"];
  }): Promise<AdoptionResponseDTO[]> {
    try {
      const { data } = await api.get<AdoptionResponseDTO[]>("/adoptions", {
        params: filter,
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<AdoptionResponseDTO | null> {
    try {
      const { data } = await api.get<AdoptionResponseDTO | null>(`/adoptions/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateAdoptionDTO): Promise<AdoptionResponseDTO> {
    try {
      const { data } = await api.post<AdoptionResponseDTO>("/adoptions", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(id: string, dto: UpdateAdoptionDTO): Promise<AdoptionResponseDTO> {
    try {
      const { data } = await api.patch<AdoptionResponseDTO>(`/adoptions/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/adoptions/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};
