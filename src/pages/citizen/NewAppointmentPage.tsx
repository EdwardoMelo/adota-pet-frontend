import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  appointmentService,
  procedureService,
  shelterService,
  userPetService,
} from "@/services";
import type {
  ProcedureResponseDTO,
  ShelterResponseDTO,
  UserPetResponseDTO,
} from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatAddressInline } from "@/lib/address";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";
import { apiErrorProps, track } from "@/lib/analytics";

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const appointmentStartedRef = useRef(false);

  const [shelters, setShelters] = useState<ShelterResponseDTO[]>([]);
  const [procedures, setProcedures] = useState<ProcedureResponseDTO[]>([]);
  const [userPets, setUserPets] = useState<UserPetResponseDTO[]>([]);
  const requestedUserPetId = params.get("userPetId");
  const tenantIdParam = params.get("tenantId") ?? "";
  const [shelterId, setShelterId] = useState<string>(params.get("shelterId") ?? "");
  const [procedureId, setProcedureId] = useState<string>("");
  const [userPetId, setUserPetId] = useState<string>(requestedUserPetId ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProcs, setLoadingProcs] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    shelterService.getAll().then((list) =>
      setShelters(
        list.map((shelter) => ({
          ...shelter,
          id: String(shelter.id),
          tenantId: String(shelter.tenantId),
        })),
      ),
    );
    if (!user) return;
    userPetService.getByUser(user.id).then((pets) => {
      const normalizedPets = pets.map((pet) => ({ ...pet, id: String(pet.id) }));
      setUserPets(normalizedPets);
      if (!normalizedPets.length) return;
      if (requestedUserPetId && normalizedPets.some((p) => p.id === requestedUserPetId)) {
        setUserPetId(requestedUserPetId);
        return;
      }
      setUserPetId((current) => current || normalizedPets[0].id);
    });
  }, [user, requestedUserPetId]);

  useEffect(() => {
    if (!user || appointmentStartedRef.current) return;
    appointmentStartedRef.current = true;
    track("appointment_started", {
      role: user.role,
      source_page: location.pathname,
      tenant_id: tenantIdParam || undefined,
    });
  }, [user, location.pathname, tenantIdParam]);

  useEffect(() => {
    if (shelterId || !tenantIdParam || !shelters.length) return;
    const match = shelters.find((shelter) => shelter.tenantId === tenantIdParam);
    if (match) setShelterId(match.id);
  }, [shelters, shelterId, tenantIdParam]);

  const selectedShelter = useMemo(
    () => shelters.find((shelter) => shelter.id === shelterId) ?? null,
    [shelters, shelterId],
  );
  const selectedTenantId = selectedShelter?.tenantId ?? "";

  useEffect(() => {
    setProcedureId("");
    if (!selectedTenantId) {
      setProcedures([]);
      return;
    }
    setLoadingProcs(true);
    procedureService
      .getActiveByTenant(selectedTenantId)
      .then((list) => {
        const normalizedList = list.map((procedure) => ({
          ...procedure,
          id: String(procedure.id),
        }));
        const nonVisitProcedures = normalizedList.filter(
          (procedure) => !/visita|visita ao pet|visit/i.test(procedure.name),
        );
        setProcedures(nonVisitProcedures);
      })
      .finally(() => setLoadingProcs(false));
  }, [selectedTenantId]);

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.id === procedureId) ?? null,
    [procedures, procedureId],
  );
  const selectedShelterAddress = selectedShelter
    ? formatAddressInline(selectedShelter.address)
    : "";
  const mapsHref = selectedShelter
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${selectedShelter.name} ${selectedShelterAddress}`,
      )}`
    : "";

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!user) return;
    if (!userPets.length) return toast.error("Cadastre um pet antes de agendar um procedimento.");
    if (!selectedTenantId) return toast.error("Escolha um abrigo.");
    if (!procedureId) return toast.error("Escolha um procedimento.");
    if (!userPetId) return toast.error("Escolha um pet cadastrado.");
    if (!scheduledAt) return toast.error("Escolha uma data e horário.");

    try {
      setSubmitting(true);
      await appointmentService.create({
        tenantId: selectedTenantId,
        userId: user.id,
        procedureId,
        userPetId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
      });
      toast.success("Agendamento criado com sucesso!");
      track("appointment_created", {
        role: user.role,
        source_page: location.pathname,
        tenant_id: selectedTenantId,
        shelter_id: shelterId,
        procedure_id: procedureId,
      });
      navigate("/appointments");
    } catch (error) {
      store.dispatch(clearFeedback());
      track("appointment_create_failed", {
        role: user.role,
        source_page: location.pathname,
        tenant_id: selectedTenantId,
        shelter_id: shelterId,
        procedure_id: procedureId,
        ...apiErrorProps(error),
      });
      setFormError(resolveApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Novo agendamento"
        description="1) Escolha o canil e confira o endereço · 2) Selecione o procedimento · 3) Vincule seu pet e a data."
      />
      <section className="container mx-auto max-w-2xl px-6 py-10">
        <Card className="border-border/60 p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormErrorAlert message={formError} />
            <div className="space-y-2">
              <Label>Canil municipal</Label>
              <Select
                value={shelterId}
                onValueChange={(v) => {
                  setFormError(null);
                  setShelterId(v);
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um abrigo" />
                </SelectTrigger>
                <SelectContent>
                  {shelters.map((shelter) => (
                    <SelectItem key={shelter.id} value={shelter.id}>
                      {shelter.name} • {formatAddressInline(shelter.address)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedShelter && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Local do atendimento
                  </p>
                  <p className="mt-1 text-sm font-medium">{selectedShelter.name}</p>
                  <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{selectedShelterAddress}</span>
                  </p>
                  <div className="mt-2">
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                      <a href={mapsHref} target="_blank" rel="noreferrer">
                        Ver rota no mapa
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Procedimento</Label>
              <Select
                value={procedureId}
                onValueChange={(v) => {
                  setFormError(null);
                  setProcedureId(v);
                }}
                disabled={!selectedTenantId || loadingProcs}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={
                      !selectedTenantId
                        ? "Selecione um abrigo primeiro"
                        : loadingProcs
                        ? "Carregando..."
                        : procedures.length === 0
                        ? "Sem serviços disponíveis neste abrigo"
                        : "Selecione um procedimento"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} • {p.durationMinutes} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProcedure && (
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <div>
                    <p>{selectedProcedure.description}</p>
                    <p className="mt-1">
                      Duração estimada: {selectedProcedure.durationMinutes} minutos
                    </p>
                  </div>
                </div>
              )}
              {!loadingProcs && selectedTenantId && procedures.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Este abrigo não possui serviços ativos de agendamento nesta tela. Para conhecer pets e marcar{" "}
                  <span className="font-semibold">visita</span>, use o fluxo de visita na página do pet.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seu pet</Label>
                <Button
                  asChild
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                >
                  <Link to="/my-pets">Gerenciar meus pets</Link>
                </Button>
              </div>
              <Select
                value={userPetId}
                onValueChange={(v) => {
                  setFormError(null);
                  setUserPetId(v);
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={
                      userPets.length ? "Selecione um pet" : "Cadastre um pet para continuar"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {userPets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} • {p.age} {p.age === 1 ? "ano" : "anos"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userPets.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm">
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" /> Para agendar um procedimento no canil, cadastre primeiro o animal da sua família.
                  </p>
                  <Button asChild className="mt-3 rounded-full" variant="secondary" size="sm">
                    <Link to="/my-pets">Ir para Meus pets e cadastrar</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Data e horário</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                min={minDate}
                onChange={(e) => {
                  setFormError(null);
                  setScheduledAt(e.target.value);
                }}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => {
                  setFormError(null);
                  setNotes(e.target.value);
                }}
                placeholder="Conte qualquer detalhe que ajude o atendimento..."
                className="rounded-xl"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !userPets.length}
                aria-busy={submitting}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando agendamento...
                  </>
                ) : (
                  "Confirmar agendamento"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </>
  );
}