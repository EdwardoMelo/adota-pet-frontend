import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  appointmentService,
  petService,
  tenantService,
  userService,
} from "@/services";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, CalendarClock, Loader2, PawPrint, Users } from "lucide-react";
import type { TenantResponseDTO } from "@/dtos";

const subTone = {
  active: "success",
  trialing: "accent",
  past_due: "warning",
  canceled: "danger",
} as const;

const subLabel = {
  active: "Ativo",
  trialing: "Trial",
  past_due: "Atrasado",
  canceled: "Cancelado",
} as const;

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantResponseDTO[]>([]);
  const [counts, setCounts] = useState({ users: 0, pets: 0, appts: 0 });

  useEffect(() => {
    Promise.all([
      tenantService.getAll(),
      userService.getAll(),
      petService.getAll(),
      appointmentService.getAll(),
    ]).then(([t, u, p, a]) => {
      setTenants(t);
      setCounts({ users: u.length, pets: p.length, appts: a.length });
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: "Canis ativos", value: tenants.length, icon: Building2 },
    { label: "Usuários", value: counts.users, icon: Users },
    { label: "Pets cadastrados", value: counts.pets, icon: PawPrint },
    { label: "Agendamentos", value: counts.appts, icon: CalendarClock },
  ];

  return (
    <>
      <PageHeader
        title="Visão geral do sistema"
        description="Métricas globais e gestão multi-tenant da plataforma AdotaPet."
      />
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <Card key={s.label} className="border-border/60 p-6 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-10 border-border/60 p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Canis cadastrados</h2>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/admin/tenants">Gerenciar</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-secondary/40 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                    <StatusBadge
                      label={subLabel[t.subscriptionStatus]}
                      tone={subTone[t.subscriptionStatus]}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </section>
    </>
  );
}