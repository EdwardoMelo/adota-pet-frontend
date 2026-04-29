import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adoptionService, petService, shelterService } from "@/services";
import type {
  AdoptionResponseDTO,
  PetResponseDTO,
  ShelterResponseDTO,
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
  const [shelterMap, setShelterMap] = useState<Record<string, ShelterResponseDTO>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [list, pets, shelters] = await Promise.all([
      adoptionService.getAll({ userId: user.id }),
      petService.getAll(),
      shelterService.getAll(),
    ]);
    setItems(
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    );
    setPetMap(Object.fromEntries(pets.map((p) => [p.id, p])));
    const sheltersByTenant = shelters.reduce<Record<string, ShelterResponseDTO>>((acc, shelter) => {
      const key = String(shelter.tenantId);
      if (!acc[key]) acc[key] = shelter;
      return acc;
    }, {});
    setShelterMap(sheltersByTenant);
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
        description="Após solicitar em um pet, o canil analisa — use esta lista para ver pendente, concluída ou cancelada."
      />
      <section className="container mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ainda não escolheu um pet?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore o catálogo e solicite adoção na ficha do animal; depois volte aqui para acompanhar.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/pets">Ir para pets disponíveis</Link>
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="Nenhuma adoção ainda"
            description="Abra um pet que você goste, faça login se precisar e clique em Adotar — sua solicitação aparecerá aqui."
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
              const shelter = shelterMap[adoption.tenantId];
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
                      {shelter && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {shelter.name}
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
