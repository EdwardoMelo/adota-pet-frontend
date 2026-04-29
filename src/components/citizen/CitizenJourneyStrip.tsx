import { Link, useLocation } from "react-router-dom";
import { ChevronRight, PawPrint, Stethoscope, ClipboardList, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { to: "/pets", label: "Ver pets", short: "1", icon: PawPrint },
  { to: "/my-pets", label: "Meus pets", short: "2", icon: HeartHandshake },
  { to: "/appointments/new", label: "Agendar", short: "3", icon: Stethoscope },
  { to: "/appointments", label: "Acompanhar", short: "4", icon: ClipboardList },
] as const;

function stepIndexForPath(pathname: string): number {
  if (pathname.startsWith("/appointments/visit") || pathname.startsWith("/appointments/new")) return 2;
  if (pathname.startsWith("/appointments")) return 3;
  if (pathname.startsWith("/adoptions")) return 3;
  if (pathname.startsWith("/my-pets")) return 1;
  if (pathname.startsWith("/pets")) return 0;
  return 0;
}

export function CitizenJourneyStrip() {
  const { pathname } = useLocation();
  const activeIdx = stepIndexForPath(pathname);

  return (
    <div className="border-b border-border/60 bg-secondary/30">
      <div className="container mx-auto px-4 py-2.5 sm:px-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Sua jornada como cidadão
        </p>
        <nav aria-label="Passos sugeridos" className="flex flex-wrap items-center gap-1 sm:gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeIdx;
            return (
              <span key={step.to} className="flex items-center gap-1 sm:gap-2">
                {i > 0 && (
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/60 sm:block" />
                )}
                <Link
                  to={step.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-smooth sm:px-3 sm:text-sm",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-soft"
                      : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-[10px] font-bold sm:hidden">
                    {step.short}
                  </span>
                  <Icon className="hidden h-3.5 w-3.5 sm:inline" />
                  <span>{step.label}</span>
                </Link>
              </span>
            );
          })}
        </nav>
        <p className="mt-2 hidden text-[11px] text-muted-foreground sm:block">
          Dica: cadastre seu pet em “Meus pets” antes de agendar castração ou consulta no canil.
        </p>
      </div>
    </div>
  );
}
