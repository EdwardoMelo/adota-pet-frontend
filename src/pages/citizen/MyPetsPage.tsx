import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userPetService } from "@/services";
import type { UserPetResponseDTO, UserPetType } from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Cat, Dog, Loader2, PawPrint, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  name: "",
  age: 1,
  type: "dog" as UserPetType,
  notes: "",
};

const typeIcon = { dog: Dog, cat: Cat, other: Sparkles } as const;
const typeLabel = { dog: "Cão", cat: "Gato", other: "Outro" } as const;

export default function MyPetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<UserPetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserPetResponseDTO | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    setPets(await userPetService.getByUser(user.id));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(p: UserPetResponseDTO) {
    setEditing(p);
    setForm({ name: p.name, age: p.age, type: p.type, notes: p.notes ?? "" });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      if (editing) {
        await userPetService.update(editing.id, {
          name: form.name,
          age: form.age,
          type: form.type,
          notes: form.notes || undefined,
        });
        toast.success("Pet atualizado.");
      } else {
        await userPetService.create({
          userId: user.id,
          name: form.name,
          age: form.age,
          type: form.type,
          notes: form.notes || undefined,
        });
        toast.success("Pet cadastrado.");
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
    if (!confirm("Remover este pet?")) return;
    await userPetService.remove(id);
    toast.success("Pet removido.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Meus pets"
        description="Cadastre seus animais para agilizar agendamentos."
        actions={
          <Button
            onClick={openCreate}
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-1 h-4 w-4" /> Novo pet
          </Button>
        }
      />

      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : pets.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="Você ainda não cadastrou pets"
            description="Adicione seu primeiro pet para vinculá-lo aos agendamentos."
            action={
              <Button
                onClick={openCreate}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-1 h-4 w-4" /> Cadastrar pet
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pets.map((p) => {
              const Icon = typeIcon[p.type];
              return (
                <Card
                  key={p.id}
                  className="flex items-start justify-between gap-4 border-border/60 p-5 shadow-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabel[p.type]} • {p.age} {p.age === 1 ? "ano" : "anos"}
                      </p>
                      {p.notes && (
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                          {p.notes}
                        </p>
                      )}
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
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar pet" : "Novo pet"}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={form.age}
                  required
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as UserPetType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cão</SelectItem>
                    <SelectItem value="cat">Gato</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Alergias, comportamento, etc."
              />
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