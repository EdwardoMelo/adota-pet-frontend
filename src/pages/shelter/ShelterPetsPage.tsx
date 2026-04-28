import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService, petService } from "@/services";
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
  imageUrl: "",
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(form.imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, form.imageUrl]);

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
    setSelectedFile(null);
    setPreviewUrl("");
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
    setSelectedFile(null);
    setPreviewUrl(p.imageUrl);
    setOpen(true);
  }

  function makeFilename(file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ownerId = tenant?.id ?? "unknown";
    return `pet-${ownerId}-${Date.now()}-${safeName}`;
  }

  function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    setSelectedFile(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    if (!editing && !selectedFile) {
      toast.error("Selecione uma imagem para o pet.");
      return;
    }

    let uploadedImageUrl: string | null = null;

    try {
      setSaving(true);
      const imageUrl = selectedFile
        ? await FirebaseService.upload(selectedFile, makeFilename(selectedFile))
        : form.imageUrl;

      uploadedImageUrl = selectedFile ? imageUrl : null;

      if (editing) {
        await petService.update(editing.id, { ...form, imageUrl });
        toast.success("Pet atualizado.");
      } else {
        await petService.create({ ...form, imageUrl, tenantId: tenant.id });
        toast.success("Pet cadastrado.");
      }

      setSelectedFile(null);
      setPreviewUrl("");
      setOpen(false);
      load();
    } catch {
      if (uploadedImageUrl) {
        await FirebaseService.delete(uploadedImageUrl).catch(() => {
          toast.warning("Upload revertido parcialmente. Remova o arquivo manualmente no Firebase.");
        });
      }
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
              <Label htmlFor="img-upload">Imagem</Label>
              <div
                className={`rounded-lg border border-dashed p-4 text-sm ${
                  isDragging ? "border-accent bg-accent/5" : "border-border"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFile(event.dataTransfer.files?.[0]);
                }}
              >
                <Input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Arraste uma imagem aqui ou selecione um arquivo.
                </p>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Pré-visualização da imagem do pet"
                    className="mt-3 h-28 w-28 rounded-lg object-cover"
                  />
                )}
              </div>
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