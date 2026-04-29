import axios from "axios";
import type { AxiosError } from "axios";
import { store } from "@/store";
import { setFeedback } from "@/store/feedbackSlice";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

export function resolveApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const status = axiosError.response?.status;
  const backendMessage = axiosError.response?.data?.message;
  if (Array.isArray(backendMessage)) return backendMessage.join(", ");
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage;

  if (axiosError.code === "ECONNABORTED" || axiosError.message?.toLowerCase().includes("timeout")) {
    return "A requisição demorou demais. Verifique sua conexão e tente novamente.";
  }
  if (axiosError.message === "Network Error" || axiosError.code === "ERR_NETWORK") {
    return "Não foi possível conectar ao servidor. Verifique sua internet ou se o serviço está disponível.";
  }

  if (status === 401) return "Sessão expirada ou credenciais inválidas. Entre novamente.";
  if (status === 403) return "Você não tem permissão para esta ação.";
  if (status === 404) return "Recurso não encontrado.";
  if (status === 409) return "Conflito: talvez este registro já exista ou o horário não está disponível.";
  if (status === 422) return "Alguns dados enviados são inválidos. Confira os campos e tente de novo.";
  if (status !== undefined && status >= 500) {
    return "O servidor encontrou um erro. Tente novamente em instantes.";
  }

  if (axiosError.message) return axiosError.message;
  return "Erro inesperado ao comunicar com o servidor.";
}

export function dispatchApiError(error: unknown): never {
  store.dispatch(
    setFeedback({
      message: resolveApiErrorMessage(error),
      type: "error",
    }),
  );
  throw error;
}