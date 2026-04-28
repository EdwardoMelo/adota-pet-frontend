import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  appointmentService,
  procedureService,
  tenantService,
  userPetService,
} from "@/services";
import type {
  AppointmentResponseDTO,
  ProcedureResponseDTO,
  TenantResponseDTO,
  UserPetResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarClock, Loader2, MapPin, Plus, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { formatAddressInline } from "@/lib/address";

const statusTone = {
  scheduled: "accent",
  confirmed: "success",
  completed: "muted",
  cancelled: "danger",
} as const;

const statusLabel = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const;

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppointmentResponseDTO[]>([]);
  const [procMap, setProcMap] = useState<Record<string, ProcedureResponseDTO>>({});
  const [tenantMap, setTenantMap] = useState<Record<string, TenantResponseDTO>>({});
  const [petMap, setPetMap] = useState<Record<string, UserPetResponseDTO>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [list, tenants, pets] = await Promise.all([
      appointmentService.getAll({ userId: user.id }),
      tenantService.getAll(),
      userPetService.getByUser(user.id),
    ]);

    const procIds = Array.from(new Set(list.map((a) => a.procedureId)));
    const procs = await Promise.all(procIds.map((id) => procedureService.getById(id)));
    setProcMap(
      Object.fromEntries(
        procs.filter((p): p is ProcedureResponseDTO => !!p).map((p) => [p.id, p]),
      ),
    );
    setTenantMap(Object.fromEntries(tenants.map((t) => [t.id, t])));
    setPetMap(Object.fromEntries(pets.map((p) => [p.id, p])));
    setItems(
      list.sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCancel(id: string) {
    try {
      await appointmentService.update(id, { status: "cancelled" });
      toast.success("Agendamento cancelado.");
      load();
    } catch {
      toast.error("Erro ao cancelar.");
    }
  }

  return (
    <>
      <PageHeader
        title="Meus agendamentos"
        description="Acompanhe consultas e procedimentos agendados."
        actions={
          <Button
            asChild
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to="/appointments/new">
              <Plus className="mr-1 h-4 w-4" /> Novo agendamento
            </Link>
          </Button>
        }
      />

      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum agendamento ainda"
            description="Quando você agendar um procedimento, ele aparecerá aqui."
            action={
              <Button
                asChild
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/appointments/new">Criar agendamento</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {items.map((appt) => {
              const proc = procMap[appt.procedureId];
              const tenant = tenantMap[appt.tenantId];
              const pet = appt.userPetId ? petMap[appt.userPetId] : null;
              return (
                <Card
                  key={appt.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold">
                        {proc?.name ?? "Procedimento"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appt.scheduledAt), "dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                      {tenant && (
                        <>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                            {tenant.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {formatAddressInline(tenant.address)}
                          </p>
                        </>
                      )}
                      {pet && (
                        <p className="text-xs text-muted-foreground">Pet: {pet.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      label={statusLabel[appt.status]}
                      tone={statusTone[appt.status]}
                    />
                    {(appt.status === "scheduled" || appt.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel(appt.id)}
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}