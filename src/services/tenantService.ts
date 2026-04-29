import { api, dispatchApiError } from "./apiClient";
import type { TenantResponseDTO, CreateTenantDTO, UpdateTenantDTO } from "@/dtos";

export const tenantService = {
  async getAll(filters?: {
    search?: string;
    city?: string;
    state?: string;
  }): Promise<TenantResponseDTO[]> {
    try {
      const { data } = await api.get<TenantResponseDTO[]>("/tenants", {
        params: filters,
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<TenantResponseDTO | null> {
    try {
      const { data } = await api.get<TenantResponseDTO | null>(`/tenants/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateTenantDTO): Promise<TenantResponseDTO> {
    try {
      const { data } = await api.post<TenantResponseDTO>("/tenants", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(id: string, dto: UpdateTenantDTO): Promise<TenantResponseDTO> {
    try {
      const { data } = await api.patch<TenantResponseDTO>(`/tenants/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/tenants/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};