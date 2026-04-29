import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { resolveApiErrorMessage } from "@/services/apiClient";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";
import { track } from "@/lib/analytics";

const empty = {
  name: "",
  age: 1,
  species: "dog" as PetSpecies,
  description: "",
  imageUrl: "",
  status: "available" as PetStatus,
};

export default function ShelterPetsPage() {
  const location = useLocation();
  const { tenant } = useAuth();
  const [pets, setPets] = useState<PetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PetResponseDTO | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    setPets(await petService.getAll({ tenantId: tenant.id }));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tenant]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setFormError(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setOpen(true);
  }

  function openEdit(p: PetResponseDTO) {
    setFormError(null);
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
    setFormError(null);
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
        track("shelter_pet_created", {
          role: "shelter_admin",
          source_page: location.pathname,
          tenant_id: tenant.id,
        });
      }

      setSelectedFile(null);
      setPreviewUrl("");
      setOpen(false);
      load();
    } catch (error) {
      if (uploadedImageUrl) {
        await FirebaseService.delete(uploadedImageUrl).catch(() => {
          toast.warning("Upload revertido parcialmente. Remova o arquivo manualmente no Firebase.");
        });
      }
      store.dispatch(clearFeedback());
      setFormError(resolveApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await petService.remove(deleteId);
      toast.success("Pet removido.");
      setDeleteId(null);
      load();
    } catch (error) {
      store.dispatch(clearFeedback());
      toast.error(resolveApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
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
                    onClick={() => setDeleteId(p.id)}
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remover pet ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFormError(null);
        }}
      >
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar pet" : "Novo pet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <FormErrorAlert message={formError} />
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
                aria-busy={saving}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(next) => !next && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este pet?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O animal sairá do catálogo público do canil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              aria-busy={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}