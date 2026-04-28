import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService, procedureService, shelterPetService } from "@/services";
import type {
  AppointmentResponseDTO,
  ProcedureResponseDTO,
  ShelterPetResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, PawPrint, CheckCircle2, Loader2, Stethoscope } from "lucide-react";

export default function ShelterDashboardPage() {
  const { tenant } = useAuth();
  const [pets, setPets] = useState<ShelterPetResponseDTO[]>([]);
  const [appts, setAppts] = useState<AppointmentResponseDTO[]>([]);
  const [procs, setProcs] = useState<ProcedureResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      shelterPetService.getAll(tenant.id),
      appointmentService.getAll({ tenantId: tenant.id }),
      procedureService.getAll(tenant.id),
    ]).then(([p, a, pr]) => {
      setPets(p);
      setAppts(a);
      setProcs(pr);
      setLoading(false);
    });
  }, [tenant]);

  const available = pets.filter((p) => p.status === "available").length;
  const adopted = pets.filter((p) => p.status === "adopted").length;
  const upcoming = appts.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed",
  ).length;
  const activeProcs = procs.filter((p) => p.isActive).length;
  const procMap = Object.fromEntries(procs.map((p) => [p.id, p]));

  const stats = [
    { label: "Pets disponíveis", value: available, icon: PawPrint },
    { label: "Adoções concluídas", value: adopted, icon: CheckCircle2 },
    { label: "Agendamentos ativos", value: upcoming, icon: CalendarClock },
    { label: "Procedimentos ativos", value: activeProcs, icon: Stethoscope },
  ];

  return (
    <>
      <PageHeader
        title={`Bem-vindo, ${tenant?.name ?? ""}`}
        description="Painel de gestão do seu canil municipal."
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
                <Card
                  key={s.label}
                  className="border-border/60 p-6 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="mt-2 font-display text-4xl font-bold">{s.value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60 p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Pets recentes</h2>
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <Link to="/shelter/pets">Ver todos</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {pets.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.age} anos • {p.status === "available" ? "Disponível" : "Adotado"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-border/60 p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Próximos agendamentos</h2>
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <Link to="/shelter/appointments">Ver todos</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {appts.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {procMap[a.procedureId]?.name ?? "Procedimento"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.scheduledAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-accent">{a.status}</span>
                    </div>
                  ))}
                  {appts.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </section>
    </>
  );
}