import { api, dispatchApiError } from "./apiClient";
import type {
  UserPetResponseDTO,
  CreateUserPetDTO,
  UpdateUserPetDTO,
} from "@/dtos";

export const userPetService = {
  async getByUser(userId: string): Promise<UserPetResponseDTO[]> {
    try {
      const { data } = await api.get<UserPetResponseDTO[]>("/user-pets", {
        params: { userId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<UserPetResponseDTO | null> {
    try {
      const { data } = await api.get<UserPetResponseDTO | null>(`/user-pets/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateUserPetDTO): Promise<UserPetResponseDTO> {
    try {
      const { data } = await api.post<UserPetResponseDTO>("/user-pets", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(
    id: string,
    dto: UpdateUserPetDTO,
  ): Promise<UserPetResponseDTO> {
    try {
      const { data } = await api.patch<UserPetResponseDTO>(`/user-pets/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/user-pets/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};