import { api, dispatchApiError } from "./apiClient";
import type {
  ProcedureResponseDTO,
  CreateProcedureDTO,
  UpdateProcedureDTO,
} from "@/dtos";

export const procedureService = {
  async getAll(tenantId?: string): Promise<ProcedureResponseDTO[]> {
    try {
      const { data } = await api.get<ProcedureResponseDTO[]>("/procedures", {
        params: { tenantId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getActiveByTenant(tenantId: string): Promise<ProcedureResponseDTO[]> {
    try {
      const { data } = await api.get<ProcedureResponseDTO[]>("/procedures/active", {
        params: { tenantId },
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async getById(id: string): Promise<ProcedureResponseDTO | null> {
    try {
      const { data } = await api.get<ProcedureResponseDTO | null>(`/procedures/${id}`);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async create(dto: CreateProcedureDTO): Promise<ProcedureResponseDTO> {
    try {
      const { data } = await api.post<ProcedureResponseDTO>("/procedures", dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async update(
    id: string,
    dto: UpdateProcedureDTO,
  ): Promise<ProcedureResponseDTO> {
    try {
      const { data } = await api.patch<ProcedureResponseDTO>(`/procedures/${id}`, dto);
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/procedures/${id}`);
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};