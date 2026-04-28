import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { procedureService } from "@/services";
import type { ProcedureResponseDTO } from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, Loader2, Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  name: "",
  description: "",
  durationMinutes: 30,
  isActive: true,
};

export default function ShelterProceduresPage() {
  const { tenant } = useAuth();
  const [procs, setProcs] = useState<ProcedureResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcedureResponseDTO | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!tenant) return;
    setLoading(true);
    setProcs(await procedureService.getAll(tenant.id));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(p: ProcedureResponseDTO) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      durationMinutes: p.durationMinutes,
      isActive: p.isActive,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    try {
      setSaving(true);
      if (editing) {
        await procedureService.update(editing.id, form);
        toast.success("Procedimento atualizado.");
      } else {
        await procedureService.create({ ...form, tenantId: tenant.id });
        toast.success("Procedimento cadastrado.");
      }
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este procedimento?")) return;
    await procedureService.remove(id);
    toast.success("Procedimento removido.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Procedimentos"
        description="Cadastre os serviços oferecidos pelo seu canil."
        actions={
          <Button
            onClick={openCreate}
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1 h-4 w-4" /> Novo procedimento
          </Button>
        }
      />

      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : procs.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Nenhum procedimento cadastrado"
            description="Cadastre os serviços oferecidos para que cidadãos possam agendá-los."
            action={
              <Button
                onClick={openCreate}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-1 h-4 w-4" /> Cadastrar
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {procs.map((p) => (
              <Card
                key={p.id}
                className="flex flex-wrap items-start justify-between gap-4 border-border/60 p-5 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-accent">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-bold">{p.name}</p>
                      <StatusBadge
                        label={p.isActive ? "Ativo" : "Inativo"}
                        tone={p.isActive ? "success" : "muted"}
                      />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {p.durationMinutes} minutos
                    </p>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(p)}
                    className="rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(p.id)}
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar procedimento" : "Novo procedimento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.description}
                required
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dur">Duração (min)</Label>
                <Input
                  id="dur"
                  type="number"
                  min={5}
                  step={5}
                  value={form.durationMinutes}
                  required
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
                  <Label htmlFor="active" className="text-sm">Ativo</Label>
                  <Switch
                    id="active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}