import { api, dispatchApiError } from "./apiClient";

type TicketStatus = "pending" | "approved" | "rejected";

export interface AdminRegisterTicketResponseDTO {
  id: number;
  userName: string;
  userEmail: string;
  status: TicketStatus;
  payload: {
    user?: {
      name: string;
      email: string;
    };
    shelter?: {
      name: string;
      cnpj?: string | null;
      contact: string;
      address:
        | {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            number: string;
            apartment?: string | null;
          }
        | string;
      email: string;
    };
  };
  createdAt: string;
  reviewedAt: string | null;
}

const superAdminHeaders = {
  "x-role": "super_admin",
};

export const adminRegisterTicketService = {
  async getAll(): Promise<AdminRegisterTicketResponseDTO[]> {
    try {
      const { data } = await api.get<AdminRegisterTicketResponseDTO[]>(
        "/admin/register-tickets",
        {
          headers: superAdminHeaders,
        },
      );
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async approve(id: number): Promise<AdminRegisterTicketResponseDTO> {
    try {
      const { data } = await api.patch<AdminRegisterTicketResponseDTO>(
        `/admin/register-tickets/${id}/approve`,
        {},
        {
          headers: superAdminHeaders,
        },
      );
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async reject(id: number): Promise<AdminRegisterTicketResponseDTO> {
    try {
      const { data } = await api.patch<AdminRegisterTicketResponseDTO>(
        `/admin/register-tickets/${id}/reject`,
        {},
        {
          headers: superAdminHeaders,
        },
      );
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};
