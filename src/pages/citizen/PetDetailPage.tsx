import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { adoptionService, petService, shelterService } from "@/services";
import type { PetResponseDTO, ShelterResponseDTO } from "@/dtos";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, Heart, Loader2, MapPin } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";
import { track } from "@/lib/analytics";

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<PetResponseDTO | null>(null);
  const [shelter, setShelter] = useState<ShelterResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAdoption, setSubmittingAdoption] = useState(false);
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false);
  const [adoptionError, setAdoptionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    petService.getById(id).then(async (p) => {
      setPet(p);
      if (p) {
        const shelters = await shelterService.getAll({ tenantId: p.tenantId });
        setShelter(shelters[0] ?? null);
      } else {
        setShelter(null);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (loading || !pet) return;
    track("pet_detail_viewed", {
      role: user?.role ?? "anonymous",
      source_page: location.pathname,
      tenant_id: pet.tenantId,
      shelter_id: shelter?.id,
      pet_id: pet.id,
    });
  }, [loading, pet?.id, shelter?.id, user?.role, location.pathname]);

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

  async function confirmAdoption() {
    if (!user || !pet) return;
    setAdoptionError(null);
    try {
      setSubmittingAdoption(true);
      await adoptionService.create({
        tenantId: pet.tenantId,
        petId: pet.id,
        userId: user.id,
      });
      track("adoption_requested", {
        role: "citizen",
        source_page: location.pathname,
        tenant_id: pet.tenantId,
        shelter_id: shelter?.id,
        pet_id: pet.id,
      });
      toast.success("Solicitação de adoção registrada com status pendente.");
      setAdoptDialogOpen(false);
      navigate("/adoptions");
    } catch (error) {
      store.dispatch(clearFeedback());
      setAdoptionError(resolveApiErrorMessage(error));
    } finally {
      setSubmittingAdoption(false);
    }
  }

  function handleAdoptClick() {
    if (!user) {
      toast.info("Faça login para solicitar adoção.");
      navigate("/login");
      return;
    }
    if (user.role !== "citizen") {
      toast.info("Somente contas de cidadão podem solicitar adoção por esta via.");
      return;
    }
    setAdoptionError(null);
    setAdoptDialogOpen(true);
  }

  function handleVisitClick() {
    if (!user) {
      toast.info("Faça login para agendar uma visita.");
      navigate("/login");
      return;
    }
    navigate(`/appointments/visit/${pet.id}`);
  }

  const citizenHint =
    user?.role === "citizen" ? (
      <CardCtas petId={pet.id} />
    ) : null;

  return (
    <div className="container mx-auto px-6 py-10">
      <Button
        variant="ghost"
        onClick={() => navigate("/pets")}
        className="mb-6 gap-2 rounded-full"
      >
        <ArrowLeft className="h-4 w-4" /> Todos os pets
      </Button>

      {citizenHint}

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
            {shelter && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {shelter.name}
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
              disabled={pet.status !== "available" || user?.role !== "citizen" || submittingAdoption}
              onClick={handleAdoptClick}
              aria-busy={submittingAdoption}
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
          {user?.role === "citizen" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Próximo passo após solicitar adoção: acompanhe o status em{" "}
              <Link to="/adoptions" className="font-semibold text-accent underline-offset-4 hover:underline">
                Minhas adoções
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={adoptDialogOpen} onOpenChange={setAdoptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar solicitação de adoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Se você prosseguir, o abrigo será notificado e poderá dar sequência à preparação do pet para a sua
              chegada. Você poderá acompanhar o status em &quot;Minhas adoções&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FormErrorAlert message={adoptionError} title="Erro ao registrar" />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingAdoption}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={submittingAdoption}
              aria-busy={submittingAdoption}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => void confirmAdoption()}
            >
              {submittingAdoption ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar adoção"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardCtas({ petId }: { petId: string }) {
  return (
    <div className="mb-8 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Sugestão de passos</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to={`/appointments/visit/${petId}`}>Agendar visita antes de decidir</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/my-pets">Cadastrar meus pets (para procedimentos)</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link to="/pets">Ver outros animais</Link>
        </Button>
      </div>
    </div>
  );
}
