import { api, dispatchApiError } from "./apiClient";
import type { UserResponseDTO } from "@/dtos";

export interface CreateCitizenDTO {
  name: string;
  email: string;
  password: string;
}

export interface CreateAdminRegisterTicketDTO {
  name: string;
  email: string;
  password: string;
  shelter: {
    name: string;
    cnpj?: string;
    contact: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      number: string;
      apartment?: string;
    };
    email: string;
  };
}

export interface AdminRegisterTicketResponseDTO {
  id: string;
  userName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  payload: unknown;
  createdAt: string;
  reviewedAt: string | null;
}

export const onboardingService = {
  async createCitizen(dto: CreateCitizenDTO): Promise<{ user: UserResponseDTO }> {
    try {
      const { data } = await api.post<{ user: UserResponseDTO }>(
        "/onboarding/citizen",
        dto,
      );
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },

  async createAdminRegisterTicket(
    dto: CreateAdminRegisterTicketDTO,
  ): Promise<AdminRegisterTicketResponseDTO> {
    try {
      const { data } = await api.post<AdminRegisterTicketResponseDTO>(
        "/onboarding/admin-register-ticket",
        dto,
      );
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};
