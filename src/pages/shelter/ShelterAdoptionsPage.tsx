import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adoptionService, petService, userService } from "@/services";
import type {
  AdoptionResponseDTO,
  AdoptionStatus,
  PetResponseDTO,
  UserResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Check, HeartHandshake, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const statusTone = {
  pending: "warning",
  completed: "success",
  cancelled: "danger",
} as const;

const statusLabel = {
  pending: "Pendente",
  completed: "Concluída",
  cancelled: "Cancelada",
} as const;

export default function ShelterAdoptionsPage() {
  const { tenant } = useAuth();
  const [items, setItems] = useState<AdoptionResponseDTO[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserResponseDTO>>({});
  const [petMap, setPetMap] = useState<Record<string, PetResponseDTO>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!tenant) return;
    setLoading(true);
    const [list, users, pets] = await Promise.all([
      adoptionService.getAll({ tenantId: tenant.id }),
      userService.getAll(),
      petService.getAll(tenant.id),
    ]);
    setItems(
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    );
    setUsersMap(Object.fromEntries(users.map((u) => [u.id, u])));
    setPetMap(Object.fromEntries(pets.map((p) => [p.id, p])));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function setStatus(id: string, status: AdoptionStatus) {
    await adoptionService.update(id, { status });
    toast.success("Status da adoção atualizado.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Adoções"
        description="Acompanhe e conclua as solicitações de adoção dos cidadãos."
      />
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="Sem solicitações de adoção"
            description="Novas solicitações aparecerão aqui."
          />
        ) : (
          <div className="space-y-3">
            {items.map((a) => {
              const u = usersMap[a.userId];
              const pet = petMap[a.petId];
              return (
                <Card
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div>
                    <p className="font-display text-base font-bold">
                      {pet?.name ?? "Pet"} • {u?.name ?? "Cidadão"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Solicitada em {new Date(a.createdAt).toLocaleString("pt-BR")}
                    </p>
                    {a.notes && (
                      <p className="mt-1 max-w-xl text-xs italic text-muted-foreground">
                        "{a.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={statusLabel[a.status]} tone={statusTone[a.status]} />
                    {a.status === "pending" && (
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
