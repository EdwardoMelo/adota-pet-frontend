import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adoptionService, petService, tenantService } from "@/services";
import type { PetResponseDTO, TenantResponseDTO } from "@/dtos";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, Heart, Loader2, MapPin } from "lucide-react";

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<PetResponseDTO | null>(null);
  const [tenant, setTenant] = useState<TenantResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAdoption, setSubmittingAdoption] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    petService.getById(id).then(async (p) => {
      setPet(p);
      if (p) setTenant(await tenantService.getById(p.tenantId));
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold">Pet não encontrado</h2>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/pets">Voltar</Link>
        </Button>
      </div>
    );
  }

  async function handleCreateAdoption() {
    if (!user) {
      toast.info("Faça login para solicitar adoção.");
      navigate("/login");
      return;
    }
    const confirmed = window.confirm(
      "Se você prosseguir, o abrigo irá prosseguir com a preparação do pet para sua chegada, confirma que deseja prosseguir com a adoção?",
    );
    if (!confirmed) return;

    try {
      setSubmittingAdoption(true);
      await adoptionService.create({
        tenantId: pet.tenantId,
        petId: pet.id,
        userId: user.id,
      });
      toast.success("Solicitação de adoção registrada com status pendente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível registrar a adoção.";
      toast.error(message);
    } finally {
      setSubmittingAdoption(false);
    }
  }

  function handleVisitClick() {
    if (!user) {
      toast.info("Faça login para agendar uma visita.");
      navigate("/login");
      return;
    }
    navigate(`/appointments/visit/${pet.id}`);
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <Button
        variant="ghost"
        onClick={() => navigate("/pets")}
        className="mb-6 gap-2 rounded-full"
      >
        <ArrowLeft className="h-4 w-4" /> Todos os pets
      </Button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-secondary shadow-card">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="h-full max-h-[520px] w-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <StatusBadge
              label={pet.status === "available" ? "Disponível" : "Adotado"}
              tone={pet.status === "available" ? "success" : "muted"}
            />
            {tenant && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {tenant.name}
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-5xl font-black">{pet.name}</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {pet.age} {pet.age === 1 ? "ano" : "anos"} •{" "}
            {pet.species === "dog" ? "Cão" : pet.species === "cat" ? "Gato" : "Outro"}
          </p>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{pet.description}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={pet.status !== "available"}
              onClick={handleVisitClick}
              className="rounded-full bg-accent text-accent-foreground shadow-warm hover:bg-accent/90"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Visitar pet
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={
                pet.status !== "available" ||
                user?.role !== "citizen" ||
                submittingAdoption
              }
              onClick={handleCreateAdoption}
              className="rounded-full"
            >
              {submittingAdoption ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Heart className="mr-2 h-4 w-4" />
              )}
              Adotar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}