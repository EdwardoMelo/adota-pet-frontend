import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PawPrint, LogOut, ChevronDown, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { homeForRole } from "@/lib/roleRoutes";

const roleLabel: Record<string, string> = {
  super_admin: "Super admin",
  shelter_admin: "Admin do canil",
  citizen: "Cidadão",
};

export function AppHeader() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = (() => {
    if (!user) return [];
    if (user.role === "citizen")
      return [
        { to: "/pets", label: "Adoção" },
        { to: "/adoptions", label: "Minhas adoções" },
        { to: "/appointments", label: "Agendamentos" },
        { to: "/my-pets", label: "Meus pets" },
      ];
    if (user.role === "shelter_admin")
      return [
        { to: "/shelter", label: "Dashboard" },
        { to: "/shelter/pets", label: "Pets" },
        { to: "/shelter/procedures", label: "Procedimentos" },
        { to: "/shelter/appointments", label: "Agendamentos" },
        { to: "/shelter/adoptions", label: "Adoções" },
      ];
    return [
      { to: "/admin", label: "Visão geral" },
      { to: "/admin/solicitacoes", label: "Solicitações" },
      { to: "/admin/tenants", label: "Canis" },
      { to: "/admin/users", label: "Usuários" },
    ];
  })();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-brand-cream/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-6">
        <Link
          to={user ? homeForRole[user.role] : "/"}
          className="flex items-center gap-2 font-display text-xl font-bold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-soft">
            <PawPrint className="h-5 w-5" />
          </span>
          AdotaPet
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-smooth ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-full">
                  <UserCircle2 className="h-5 w-5 text-accent" />
                  <span className="hidden text-left sm:flex sm:flex-col sm:leading-tight">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {roleLabel[user.role]}
                      {tenant ? ` • ${tenant.name}` : ""}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}