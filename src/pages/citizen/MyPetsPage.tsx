import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService, userPetService } from "@/services";
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
import { resolveApiErrorMessage } from "@/services/apiClient";
import { store } from "@/store";
import { clearFeedback } from "@/store/feedbackSlice";

const empty = {
  name: "",
  age: 1,
  type: "dog" as UserPetType,
  imageUrl: "",
  notes: "",
};

const typeIcon = { dog: Dog, cat: Cat, other: Sparkles } as const;
const typeLabel = { dog: "Cão", cat: "Gato", other: "Outro" } as const;

export default function MyPetsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<UserPetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserPetResponseDTO | null>(null);
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
    setFormError(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setOpen(true);
  }

  function openEdit(p: UserPetResponseDTO) {
    setFormError(null);
    setEditing(p);
    setForm({
      name: p.name,
      age: p.age,
      type: p.type,
      imageUrl: p.imageUrl ?? "",
      notes: p.notes ?? "",
    });
    setSelectedFile(null);
    setPreviewUrl(p.imageUrl ?? "");
    setOpen(true);
  }

  function makeFilename(file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ownerId = user?.id ?? "unknown";
    return `user-pet-${ownerId}-${Date.now()}-${safeName}`;
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
    if (!user) return;
    setFormError(null);
    let uploadedImageUrl: string | null = null;

    try {
      setSaving(true);
      const imageUrl = selectedFile
        ? await FirebaseService.upload(selectedFile, makeFilename(selectedFile))
        : form.imageUrl;
      uploadedImageUrl = selectedFile ? imageUrl : null;

      if (editing) {
        await userPetService.update(editing.id, {
          name: form.name,
          age: form.age,
          type: form.type,
          imageUrl: imageUrl || undefined,
          notes: form.notes || undefined,
        });
        toast.success("Pet atualizado.");
      } else {
        await userPetService.create({
          userId: user.id,
          name: form.name,
          age: form.age,
          type: form.type,
          imageUrl: imageUrl || undefined,
          notes: form.notes || undefined,
        });
        toast.success("Pet cadastrado.");
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
      await userPetService.remove(deleteId);
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
        title="Meus pets"
        description="1) Cadastre cada animal · 2) Use “Novo procedimento” para escolher canil e serviço · 3) Acompanhe em Agendamentos."
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
        <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Dica</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Os canis exigem um pet cadastrado para marcar castração ou consulta. Depois do cadastro, o próximo passo é{" "}
            <Link to="/appointments/new" className="font-semibold text-accent underline-offset-4 hover:underline">
              agendar um procedimento
            </Link>
            .
          </p>
        </div>
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
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/appointments/new?userPetId=${p.id}`)}
                      className="rounded-full"
                    >
                      Novo procedimento
                    </Button>
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
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setFormError(null);
            setSelectedFile(null);
            setPreviewUrl("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar pet" : "Novo pet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <FormErrorAlert message={formError} />
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

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este pet?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Agendamentos futuros ligados a este pet podem precisar ser revistos no
              canil.
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