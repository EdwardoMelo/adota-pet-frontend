import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adoptionService, petService, tenantService } from "@/services";
import type {
  AdoptionResponseDTO,
  PetResponseDTO,
  TenantResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { HeartHandshake, Loader2, MapPin, PawPrint } from "lucide-react";

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

export default function MyAdoptionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AdoptionResponseDTO[]>([]);
  const [petMap, setPetMap] = useState<Record<string, PetResponseDTO>>({});
  const [tenantMap, setTenantMap] = useState<Record<string, TenantResponseDTO>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [list, pets, tenants] = await Promise.all([
      adoptionService.getAll({ userId: user.id }),
      petService.getAll(),
      tenantService.getAll(),
    ]);
    setItems(
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    );
    setPetMap(Object.fromEntries(pets.map((p) => [p.id, p])));
    setTenantMap(Object.fromEntries(tenants.map((t) => [t.id, t])));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <PageHeader
        title="Minhas adoções"
        description="Acompanhe as solicitações de adoção que você já realizou."
      />
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="Nenhuma adoção ainda"
            description="Quando você solicitar a adoção de um pet, ela aparecerá aqui."
            action={
              <Button
                asChild
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/pets">Ver pets disponíveis</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {items.map((adoption) => {
              const pet = petMap[adoption.petId];
              const tenant = tenantMap[adoption.tenantId];
              return (
                <Card
                  key={adoption.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <PawPrint className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold">
                        {pet?.name ?? "Pet"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em{" "}
                        {new Date(adoption.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {tenant && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {tenant.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      label={statusLabel[adoption.status]}
                      tone={statusTone[adoption.status]}
                    />
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
