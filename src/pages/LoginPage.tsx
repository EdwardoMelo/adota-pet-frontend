import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Loader2, PawPrint } from "lucide-react";
import { homeForRole } from "@/lib/roleRoutes";
import { toast } from "sonner";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";
import { apiErrorProps, track } from "@/lib/analytics";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (user) return <Navigate to={homeForRole[user.role]} replace />;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      setSubmitting(true);
      const result = await authService.login(email, password);
      await login(result.user.id);
      track("login_success", {
        role: result.user.role,
        source_page: "/login",
        tenant_id: result.user.tenantId ?? undefined,
      });
      toast.success(`Bem-vindo, ${result.user.name.split(" ")[0]}!`);
      navigate(homeForRole[result.user.role]);
    } catch (error) {
      store.dispatch(clearFeedback());
      track("login_failed", {
        source_page: "/login",
        ...apiErrorProps(error),
      });
      setFormError(resolveApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-warm">
            <PawPrint className="h-7 w-7" />
          </span>
          <h1 className="font-display text-4xl font-bold">Entrar no AdotaPet</h1>
          <p className="mt-3 text-muted-foreground">
            Acesse com e-mail e senha da sua conta.
          </p>
        </div>

        <Card className="mx-auto max-w-md border-border/60 p-6 shadow-card">
          <form onSubmit={handleLogin} className="space-y-4">
            <FormErrorAlert message={formError} title="Não foi possível entrar" />
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError(null);
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem cadastro?{" "}
            <a href="/#onboarding" className="font-semibold text-accent hover:underline">
              Cadastre-se agora
            </a>
          </p>
        </Card>

        <p className="mt-10 text-center text-xs text-muted-foreground">Dica de ambiente dev: usuários antigos sem senha usam o padrão 123456.</p>
      </div>
    </div>
  );
}