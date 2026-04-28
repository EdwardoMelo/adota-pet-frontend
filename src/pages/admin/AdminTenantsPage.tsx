import { useEffect, useState } from "react";
import { tenantService } from "@/services";
import type { SubscriptionStatus, TenantResponseDTO } from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

const subTone = {
  active: "success",
  trialing: "accent",
  past_due: "warning",
  canceled: "danger",
} as const;

const subLabel = {
  active: "Ativo",
  trialing: "Trial",
  past_due: "Atrasado",
  canceled: "Cancelado",
} as const;

const empty = {
  name: "",
  city: "",
  subscriptionStatus: "trialing" as SubscriptionStatus,
};

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TenantResponseDTO | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setTenants(await tenantService.getAll());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(t: TenantResponseDTO) {
    setEditing(t);
    setForm({
      name: t.name,
      city: t.city,
      subscriptionStatus: t.subscriptionStatus,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await tenantService.update(editing.id, form);
        toast.success("Canil atualizado.");
      } else {
        await tenantService.create(form);
        toast.success("Canil cadastrado.");
      }
      setOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Canis municipais"
        description="Gerencie todos os canis (tenants) do sistema multi-tenant."
        actions={
          <Button
            onClick={openCreate}
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1 h-4 w-4" /> Novo canil
          </Button>
        }
      />

      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map((t) => (
              <Card
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
              >
                <div>
                  <p className="font-display text-base font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.city} • Stripe: {t.stripeAccountId ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={subLabel[t.subscriptionStatus]}
                    tone={subTone[t.subscriptionStatus]}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(t)}
                    className="rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar canil" : "Novo canil"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status da assinatura</Label>
              <Select
                value={form.subscriptionStatus}
                onValueChange={(v) =>
                  setForm({ ...form, subscriptionStatus: v as SubscriptionStatus })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="past_due">Atrasado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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