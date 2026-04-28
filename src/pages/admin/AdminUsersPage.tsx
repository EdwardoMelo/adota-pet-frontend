import { useEffect, useState } from "react";
import { tenantService, userService } from "@/services";
import type { TenantResponseDTO, UserResponseDTO, UserRole } from "@/dtos";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const roleLabel: Record<UserRole, string> = {
  super_admin: "Super admin",
  shelter_admin: "Admin do canil",
  citizen: "Cidadão",
};

const empty = {
  name: "",
  email: "",
  role: "citizen" as UserRole,
  tenantId: "" as string,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [tenants, setTenants] = useState<TenantResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [u, t] = await Promise.all([userService.getAll(), tenantService.getAll()]);
    setUsers(u);
    setTenants(t);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.create({
        name: form.name,
        email: form.email,
        role: form.role,
        tenantId:
          form.role === "super_admin" || !form.tenantId ? null : form.tenantId,
      });
      toast.success("Usuário cadastrado.");
      setOpen(false);
      setForm(empty);
      load();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este usuário?")) return;
    await userService.remove(id);
    toast.success("Usuário removido.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Controle de acesso global. Crie super admins, admins de canis e cidadãos."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1 h-4 w-4" /> Novo usuário
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
            {users.map((u) => {
              const tenant = tenants.find((t) => t.id === u.tenantId);
              return (
                <Card
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div>
                    <p className="font-display text-base font-bold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email}
                      {tenant ? ` • ${tenant.name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      label={roleLabel[u.role]}
                      tone={u.role === "super_admin" ? "danger" : u.role === "shelter_admin" ? "accent" : "muted"}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(u.id)}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Novo usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Cidadão</SelectItem>
                    <SelectItem value="shelter_admin">Admin do canil</SelectItem>
                    <SelectItem value="super_admin">Super admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role !== "super_admin" && (
                <div className="space-y-2">
                  <Label>Canil</Label>
                  <Select
                    value={form.tenantId}
                    onValueChange={(v) => setForm({ ...form, tenantId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}