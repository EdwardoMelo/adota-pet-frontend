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
  const backendMessage = axiosError.response?.data?.message;
  if (Array.isArray(backendMessage)) return backendMessage.join(", ");
  if (backendMessage) return backendMessage;
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