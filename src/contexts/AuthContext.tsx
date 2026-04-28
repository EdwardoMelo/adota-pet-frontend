import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { userService, tenantService } from "@/services";
import type { UserResponseDTO, TenantResponseDTO } from "@/dtos";

const STORAGE_KEY = "adotapet:userId";

interface AuthContextValue {
  user: UserResponseDTO | null;
  tenant: TenantResponseDTO | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [tenant, setTenant] = useState<TenantResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (userId: string | null) => {
    if (!userId) {
      setUser(null);
      setTenant(null);
      return;
    }
    const u = await userService.getById(userId);
    setUser(u);
    if (u?.tenantId) {
      const t = await tenantService.getById(u.tenantId);
      setTenant(t);
    } else {
      setTenant(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    hydrate(stored).finally(() => setLoading(false));
  }, [hydrate]);

  const login = useCallback(
    async (userId: string) => {
      setLoading(true);
      localStorage.setItem(STORAGE_KEY, userId);
      await hydrate(userId);
      setLoading(false);
    },
    [hydrate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setTenant(null);
  }, []);

  const value = useMemo(
    () => ({ user, tenant, loading, login, logout }),
    [user, tenant, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from "@/hooks/useAuth";