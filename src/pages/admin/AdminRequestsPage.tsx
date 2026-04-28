import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { adminRegisterTicketService } from "@/services";
import type { AdminRegisterTicketResponseDTO } from "@/services/adminRegisterTicketService";
import { Eye, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAddressInline } from "@/lib/address";

const statusTone = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
} as const;

const statusLabel = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
} as const;

export default function AdminRequestsPage() {
  const [items, setItems] = useState<AdminRegisterTicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminRegisterTicketResponseDTO | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const list = await adminRegisterTicketService.getAll();
    setItems(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "pending").length,
    [items],
  );

  async function handleApprove(id: number) {
    try {
      setActingId(id);
      await adminRegisterTicketService.approve(id);
      toast.success("Solicitação aprovada com sucesso.");
      await load();
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: number) {
    try {
      setActingId(id);
      await adminRegisterTicketService.reject(id);
      toast.success("Solicitação rejeitada.");
      await load();
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Solicitações"
        description="Analise os pedidos de cadastro de abrigo e aprove ou rejeite cada solicitação."
        actions={
          <StatusBadge
            label={`${pendingCount} pendentes`}
            tone={pendingCount > 0 ? "warning" : "muted"}
          />
        }
      />

      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <Card className="border-border/60 p-10 text-center shadow-card">
            <p className="font-display text-xl font-bold">Nenhuma solicitação encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Novos pedidos de cadastro aparecerão aqui.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((ticket) => (
              <Card
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-4 border-border/60 p-5 shadow-card"
              >
                <div>
                  <p className="font-display text-base font-bold">{ticket.userName}</p>
                  <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    Pedido em {new Date(ticket.createdAt).toLocaleString("pt-BR")}
                    {ticket.reviewedAt
                      ? ` • Revisado em ${new Date(ticket.reviewedAt).toLocaleString("pt-BR")}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={statusLabel[ticket.status]}
                    tone={statusTone[ticket.status]}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setSelected(ticket)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> Ver detalhes
                  </Button>
                  {ticket.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={actingId === ticket.id}
                        onClick={() => handleApprove(ticket.id)}
                      >
                        {actingId === ticket.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={actingId === ticket.id}
                        onClick={() => handleReject(ticket.id)}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-4">
                <p className="text-sm font-semibold">Responsável</p>
                <p className="text-sm text-muted-foreground">
                  {selected.payload.user?.name} • {selected.payload.user?.email}
                </p>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <p className="text-sm font-semibold">Abrigo/Entidade</p>
                <div className="mt-1 text-sm text-muted-foreground">
                  <p>Nome: {selected.payload.shelter?.name ?? "—"}</p>
                  <p>CNPJ: {selected.payload.shelter?.cnpj ?? "—"}</p>
                  <p>Contato: {selected.payload.shelter?.contact ?? "—"}</p>
                  <p>Endereço: {formatTicketAddress(selected.payload.shelter?.address)}</p>
                  <p>E-mail: {selected.payload.shelter?.email ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Payload bruto</p>
                <pre className="max-h-64 overflow-auto rounded-xl bg-black/90 p-4 text-xs text-white">
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatTicketAddress(
  address:
    | {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        number: string;
        apartment?: string | null;
      }
    | string
    | undefined,
) {
  if (!address) return "—";
  if (typeof address === "string") return address;
  return formatAddressInline(address) || "—";
}
