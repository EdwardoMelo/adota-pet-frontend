import type { UserRole } from "@/dtos";

export const homeForRole: Record<UserRole, string> = {
  super_admin: "/admin",
  shelter_admin: "/shelter",
  citizen: "/pets",
};