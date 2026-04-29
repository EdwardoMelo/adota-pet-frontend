import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentService, petService, procedureService, shelterService } from "@/services";
import type { PetResponseDTO, ProcedureResponseDTO, ShelterResponseDTO } from "@/dtos";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatAddressInline } from "@/lib/address";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";

export default function NewPetVisitPage() {
  const { petId } = useParams<{ petId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState<PetResponseDTO | null>(null);
  const [shelter, setShelter] = useState<ShelterResponseDTO | null>(null);
  const [visitProcedure, setVisitProcedure] = useState<ProcedureResponseDTO | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  })();

  useEffect(() => {
    async function bootstrapVisitContext() {
      if (!petId) {
        toast.error("Pet não informado para o agendamento de visita.");
        navigate("/pets");
        return;
      }

      try {
        setLoadingContext(true);
        const selectedPet = await petService.getById(petId);
        if (!selectedPet) {
          toast.error("Pet não encontrado.");
          navigate("/pets");
          return;
        }

        const selectedShelters = await shelterService.getAll({ tenantId: selectedPet.tenantId });
        const selectedShelter = selectedShelters[0] ?? null;
        if (!selectedShelter) {
          toast.error("Abrigo não encontrado.");
          navigate(`/pets/${petId}`);
          return;
        }

        setPet(selectedPet);
        setShelter(selectedShelter);

        const procedures = await procedureService.getActiveByTenant(selectedPet.tenantId);
        let ensuredVisitProcedure =
          procedures.find((p) => /visita|visita ao pet|visit/i.test(p.name)) ?? null;

        if (!ensuredVisitProcedure) {
          ensuredVisitProcedure = await procedureService.create({
            tenantId: selectedPet.tenantId,
            name: "Visita",
            description:
              "Momento especial para conhecer o pet com calma, criar conexão e tirar dúvidas com a equipe do abrigo.",
            durationMinutes: 30,
            isActive: true,
          });
          toast.success("Procedimento padrão 'Visita' criado para este canil.");
        }

        setVisitProcedure(ensuredVisitProcedure);
      } catch (error) {
        store.dispatch(clearFeedback());
        const msg = resolveApiErrorMessage(error);
        toast.error(msg);
        navigate("/pets");
      } finally {
        setLoadingContext(false);
      }
    }

    bootstrapVisitContext();
  }, [navigate, petId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!user || !pet || !visitProcedure || !shelter) return;
    if (!scheduledAt) {
      toast.error("Escolha uma data e horário.");
      return;
    }

    try {
      setSubmitting(true);
      const contextualNotes = [
        `Visita ao pet: ${pet.name} (ID ${pet.id})`,
        notes.trim() ? `Observações do usuário: ${notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      await appointmentService.createVisit({
        tenantId: shelter.tenantId,
        userId: user.id,
        procedureId: visitProcedure.id,
        petId: pet.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: contextualNotes,
      });

      toast.success("Visita agendada com sucesso!");
      navigate("/appointments");
    } catch (error) {
      store.dispatch(clearFeedback());
      setFormError(resolveApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingContext) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">
          Preparando visita com pet, canil e procedimento...
        </p>
      </div>
    );
  }

  if (!pet || !shelter || !visitProcedure) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Agendar visita"
        description="Pet e canil já escolhidos — escolha apenas data e horário; depois confira em Meus agendamentos."
      />
      <section className="container mx-auto max-w-2xl px-6 py-10">
        <Card className="border-border/60 p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormErrorAlert message={formError} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pet selecionado</Label>
                <Input value={`${pet.name} • ${pet.age} ${pet.age === 1 ? "ano" : "anos"}`} disabled />
              </div>
              <div className="space-y-2">
                <Label>Canil selecionado</Label>
                <Input value={`${shelter.name} • ${formatAddressInline(shelter.address)}`} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Procedimento bloqueado para visita</Label>
              <Input value={`${visitProcedure.name} • ${visitProcedure.durationMinutes} min`} disabled />
              <p className="text-xs text-muted-foreground">{visitProcedure.description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Data e horário da visita</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                min={minDate}
                onChange={(event) => {
                  setFormError(null);
                  setScheduledAt(event.target.value);
                }}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(event) => {
                  setFormError(null);
                  setNotes(event.target.value);
                }}
                placeholder="Ex.: melhor horário, observações da família..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/pets/${pet.id}`)}
                className="rounded-full"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Confirmar visita"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </>
  );
}
