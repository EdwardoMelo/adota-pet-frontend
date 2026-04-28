import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  appointmentService,
  procedureService,
  userPetService,
  userService,
} from "@/services";
import type {
  AppointmentResponseDTO,
  AppointmentStatus,
  ProcedureResponseDTO,
  UserPetResponseDTO,
  UserResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { BadgeCheck, CalendarClock, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

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

export default function ShelterAppointmentsPage() {
  const { tenant } = useAuth();
  const [items, setItems] = useState<AppointmentResponseDTO[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserResponseDTO>>({});
  const [procMap, setProcMap] = useState<Record<string, ProcedureResponseDTO>>({});
  const [petMap, setPetMap] = useState<Record<string, UserPetResponseDTO>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!tenant) return;
    setLoading(true);
    const [list, users, procs] = await Promise.all([
      appointmentService.getAll({ tenantId: tenant.id }),
      userService.getAll(),
      procedureService.getAll(tenant.id),
    ]);

    const petIds = Array.from(
      new Set(list.map((a) => a.userPetId).filter((x): x is string => !!x)),
    );
    const userIds = Array.from(new Set(list.map((a) => a.userId)));
    const petsByUser = await Promise.all(
      userIds.map((id) => userPetService.getByUser(id)),
    );
    const allPets = petsByUser.flat().filter((p) => petIds.includes(p.id));

    setItems(
      list.sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
    );
    setUsersMap(Object.fromEntries(users.map((u) => [u.id, u])));
    setProcMap(Object.fromEntries(procs.map((p) => [p.id, p])));
    setPetMap(Object.fromEntries(allPets.map((p) => [p.id, p])));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function setStatus(id: string, status: AppointmentStatus) {
    await appointmentService.update(id, { status });
    toast.success("Status atualizado.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Agendamentos"
        description="Gerencie procedimentos solicitados pelos cidadãos."
      />
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Sem agendamentos"
            description="Agendamentos novos aparecerão aqui em tempo real."
          />
        ) : (
          <div className="space-y-3">
            {items.map((a) => {
              const u = usersMap[a.userId];
              const proc = procMap[a.procedureId];
              const pet = a.userPetId ? petMap[a.userPetId] : null;
              const isOpen = a.status === "scheduled" || a.status === "confirmed";
              return (
                <Card
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div>
                    <p className="font-display text-base font-bold">
                      {proc?.name ?? "Procedimento"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(a.scheduledAt).toLocaleString("pt-BR")} •{" "}
                      {u?.name ?? "Cidadão"}
                      {pet ? ` • Pet: ${pet.name}` : ""}
                    </p>
                    {a.notes && (
                      <p className="mt-1 max-w-xl text-xs italic text-muted-foreground">
                        "{a.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={statusLabel[a.status]} tone={statusTone[a.status]} />
                    {a.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(a.id, "confirmed")}
                        className="rounded-full"
                      >
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Confirmar
                      </Button>
                    )}
                    {isOpen && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(a.id, "completed")}
                          className="rounded-full"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(a.id, "cancelled")}
                          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Cancelar
                        </Button>
                      </>
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