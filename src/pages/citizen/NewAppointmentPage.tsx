import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  appointmentService,
  procedureService,
  tenantService,
  userPetService,
} from "@/services";
import type {
  ProcedureResponseDTO,
  TenantResponseDTO,
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

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestedProcedure = params.get("procedure");

  const [tenants, setTenants] = useState<TenantResponseDTO[]>([]);
  const [procedures, setProcedures] = useState<ProcedureResponseDTO[]>([]);
  const [userPets, setUserPets] = useState<UserPetResponseDTO[]>([]);

  const [tenantId, setTenantId] = useState<string>(params.get("tenantId") ?? "");
  const [procedureId, setProcedureId] = useState<string>("");
  const [userPetId, setUserPetId] = useState<string>("none");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProcs, setLoadingProcs] = useState(false);

  useEffect(() => {
    tenantService.getAll().then(setTenants);
    if (user) userPetService.getByUser(user.id).then(setUserPets);
  }, [user]);

  useEffect(() => {
    setProcedureId("");
    if (!tenantId) {
      setProcedures([]);
      return;
    }
    setLoadingProcs(true);
    procedureService
      .getActiveByTenant(tenantId)
      .then((list) => {
        setProcedures(list);
        if (requestedProcedure === "visit") {
          const visitProcedure = list.find((p) => /visita/i.test(p.name));
          if (visitProcedure) setProcedureId(visitProcedure.id);
        }
      })
      .finally(() => setLoadingProcs(false));
  }, [tenantId, requestedProcedure]);

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.id === procedureId) ?? null,
    [procedures, procedureId],
  );

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!tenantId) return toast.error("Escolha um canil.");
    if (!procedureId) return toast.error("Escolha um procedimento.");
    if (!scheduledAt) return toast.error("Escolha uma data e horário.");

    try {
      setSubmitting(true);
      await appointmentService.create({
        tenantId,
        userId: user.id,
        procedureId,
        userPetId: userPetId === "none" ? null : userPetId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
      });
      toast.success("Agendamento criado com sucesso!");
      navigate("/appointments");
    } catch {
      toast.error("Não foi possível criar o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Novo agendamento"
        description="Escolha o canil, o procedimento e o melhor horário."
      />
      <section className="container mx-auto max-w-2xl px-6 py-10">
        <Card className="border-border/60 p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Canil municipal</Label>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um canil" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} • {t.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Procedimento</Label>
              <Select
                value={procedureId}
                onValueChange={setProcedureId}
                disabled={!tenantId || loadingProcs}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={
                      !tenantId
                        ? "Selecione um canil primeiro"
                        : loadingProcs
                        ? "Carregando..."
                        : procedures.length === 0
                        ? "Sem procedimentos disponíveis"
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seu pet (opcional)</Label>
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
              <Select value={userPetId} onValueChange={setUserPetId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem pet específico</SelectItem>
                  {userPets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} • {p.age} {p.age === 1 ? "ano" : "anos"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userPets.length === 0 && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Você ainda não cadastrou nenhum pet.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Data e horário</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                min={minDate}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                disabled={submitting}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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