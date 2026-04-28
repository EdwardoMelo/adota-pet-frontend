import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { PetResponseDTO } from "@/dtos";
import { Cat, Dog, MapPin, Sparkles } from "lucide-react";
import { formatAddressInline } from "@/lib/address";

const speciesIcon = { dog: Dog, cat: Cat, other: Sparkles } as const;

export function PetCard({ pet, to }: { pet: PetResponseDTO; to: string }) {
  const Icon = speciesIcon[pet.species];
  return (
    <Link
      to={to}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <Card className="overflow-hidden border-border/60 bg-card shadow-card transition-smooth group-hover:-translate-y-1 group-hover:shadow-soft">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
          <div className="absolute right-3 top-3">
            <StatusBadge
              label={pet.status === "available" ? "Disponível" : "Adotado"}
              tone={pet.status === "available" ? "success" : "muted"}
            />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">{pet.name}</h3>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {pet.age} {pet.age === 1 ? "ano" : "anos"}
          </p>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{pet.description}</p>
          {pet.tenant && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">
                {pet.tenant.name} • {formatAddressInline(pet.tenant.address)}
              </span>
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}