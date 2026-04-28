import { api, dispatchApiError } from "./apiClient";
import type { UserResponseDTO } from "@/dtos";

export const authService = {
  async login(email: string, password: string): Promise<{ user: UserResponseDTO }> {
    try {
      const { data } = await api.post<{ user: UserResponseDTO }>("/auth/login", {
        email,
        password,
      });
      return data;
    } catch (error) {
      return dispatchApiError(error);
    }
  },
};
