import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { petService } from "@/services";
import type { PetResponseDTO, PetSpecies, PetStatus } from "@/dtos";
import { PageHeader } from "@/components/PageHeader";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  name: "",
  age: 1,
  species: "dog" as PetSpecies,
  description: "",
  imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80",
  status: "available" as PetStatus,
};

export default function ShelterPetsPage() {
  const { tenant } = useAuth();
  const [pets, setPets] = useState<PetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PetResponseDTO | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!tenant) return;
    setLoading(true);
    setPets(await petService.getAll(tenant.id));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tenant]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(p: PetResponseDTO) {
    setEditing(p);
    setForm({
      name: p.name,
      age: p.age,
      species: p.species,
      description: p.description,
      imageUrl: p.imageUrl,
      status: p.status,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    try {
      setSaving(true);
      if (editing) {
        await petService.update(editing.id, form);
        toast.success("Pet atualizado.");
      } else {
        await petService.create({ ...form, tenantId: tenant.id });
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
    await petService.remove(id);
    toast.success("Pet removido.");
    load();
  }

  return (
    <>
      <PageHeader
        title="Pets do canil"
        description="Cadastre, edite ou remova animais disponíveis para adoção."
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
        ) : (
          <div className="grid gap-4">
            {pets.map((p) => (
              <Card
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-4 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-display text-base font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.age} anos •{" "}
                      {p.species === "dog" ? "Cão" : p.species === "cat" ? "Gato" : "Outro"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    label={p.status === "available" ? "Disponível" : "Adotado"}
                    tone={p.status === "available" ? "success" : "muted"}
                  />
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
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar pet" : "Novo pet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Espécie</Label>
                <Select
                  value={form.species}
                  onValueChange={(v) => setForm({ ...form, species: v as PetSpecies })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Cão</SelectItem>
                    <SelectItem value="cat">Gato</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as PetStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="adopted">Adotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">URL da imagem</Label>
              <Input
                id="img"
                value={form.imageUrl}
                required
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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