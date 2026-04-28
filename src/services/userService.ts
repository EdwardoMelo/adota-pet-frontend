import { api, dispatchApiError } from "./apiClient";
import type { UserResponseDTO, CreateUserDTO, UpdateUserDTO } from "@/dtos";

export const userService = {
  async getAll(): Promise<UserResponseDTO[]> {
    try {
      const { data } = await api.get<UserResponseDTO[]>("/users");
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<UserResponseDTO | null> {
    try {
      const { data } = await api.get<UserResponseDTO | null>(`/users/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getByTenant(tenantId: string): Promise<UserResponseDTO[]> {
    try {
      const { data } = await api.get<UserResponseDTO[]>("/users", {
        params: { tenantId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateUserDTO): Promise<UserResponseDTO> {
    try {
      const { data } = await api.post<UserResponseDTO>("/users", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(id: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
    try {
      const { data } = await api.patch<UserResponseDTO>(`/users/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};