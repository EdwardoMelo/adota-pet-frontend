import type { AxiosError } from "axios";
import posthog from "posthog-js";
import { resolveApiErrorMessage } from "@/services/apiClient";

export type EventProps = Record<string, string | number | boolean | null | undefined>;

function isEnabled(): boolean {
  return Boolean(import.meta.env.VITE_POSTHOG_KEY);
}

export function track(event: string, props?: EventProps) {
  if (!isEnabled()) return;
  posthog.capture(event, props);
}

export function identifyUser(userId: string, props?: EventProps) {
  if (!isEnabled()) return;
  posthog.identify(userId, props);
}

export function resetUser() {
  if (!isEnabled()) return;
  posthog.reset();
}

/** For failed API calls: HTTP status as error_code, resolved message as error_message. */
export function apiErrorProps(error: unknown): EventProps {
  const axiosError = error as AxiosError<{
    message?: string | string[];
    code?: string;
  }>;
  const status = axiosError.response?.status;
  const backendCode = axiosError.response?.data?.code;
  return {
    error_message: resolveApiErrorMessage(error),
    ...(status !== undefined ? { error_code: status } : {}),
    ...(typeof backendCode === "string" && backendCode
      ? { backend_code: backendCode }
      : {}),
  };
}
