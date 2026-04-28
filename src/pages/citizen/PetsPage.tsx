import { useEffect, useMemo, useState } from "react";
import { petService } from "@/services";
import type { PetResponseDTO, PetSpecies } from "@/dtos";
import { PetCard } from "@/components/PetCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PawPrint, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const speciesFilters: { value: PetSpecies | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "dog", label: "Cães" },
  { value: "cat", label: "Gatos" },
  { value: "other", label: "Outros" },
];

export default function PetsPage() {
  const [pets, setPets] = useState<PetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<PetSpecies | "all">("all");

  useEffect(() => {
    petService
      .getAvailable()
      .then(setPets)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (species !== "all" && p.species !== species) return false;
      if (search && !`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [pets, species, search]);

  return (
    <>
      <PageHeader
        title="Pets disponíveis para adoção"
        description="Conheça os animais que esperam por um lar nos canis municipais parceiros."
      />

      <section className="container mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border-border/60 bg-card pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {speciesFilters.map((f) => (
              <Button
                key={f.value}
                variant={species === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSpecies(f.value)}
                className={`rounded-full ${
                  species === f.value
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : ""
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="Nenhum pet encontrado"
            description="Tente ajustar os filtros ou buscar por outro nome."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pet) => (
              <PetCard key={pet.id} pet={pet} to={`/pets/${pet.id}`} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}