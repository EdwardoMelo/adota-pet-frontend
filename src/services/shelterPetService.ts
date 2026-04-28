import { api, dispatchApiError } from "./apiClient";
import type {
  ShelterPetResponseDTO,
  CreateShelterPetDTO,
  UpdateShelterPetDTO,
} from "@/dtos";

export const shelterPetService = {
  async getAll(tenantId?: string): Promise<ShelterPetResponseDTO[]> {
    try {
      const { data } = await api.get<ShelterPetResponseDTO[]>("/shelter-pets", {
        params: { tenantId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getAvailable(tenantId?: string): Promise<ShelterPetResponseDTO[]> {
    try {
      const { data } = await api.get<ShelterPetResponseDTO[]>("/shelter-pets/available", {
        params: { tenantId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<ShelterPetResponseDTO | null> {
    try {
      const { data } = await api.get<ShelterPetResponseDTO | null>(`/shelter-pets/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateShelterPetDTO): Promise<ShelterPetResponseDTO> {
    try {
      const { data } = await api.post<ShelterPetResponseDTO>("/shelter-pets", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(
    id: string,
    dto: UpdateShelterPetDTO,
  ): Promise<ShelterPetResponseDTO> {
    try {
      const { data } = await api.patch<ShelterPetResponseDTO>(`/shelter-pets/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/shelter-pets/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};

/** Backwards-compatible alias for legacy imports. */
export const petService = shelterPetService;