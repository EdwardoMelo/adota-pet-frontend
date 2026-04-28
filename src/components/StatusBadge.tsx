import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "muted" | "accent";

const tones: Record<Tone, string> = {
  success: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  warning: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  danger: "bg-red-100 text-red-800 hover:bg-red-100",
  muted: "bg-secondary text-secondary-foreground hover:bg-secondary",
  accent: "bg-accent/15 text-accent hover:bg-accent/15",
};

export function StatusBadge({
  label,
  tone = "muted",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={cn("rounded-full border-0 font-semibold", tones[tone], className)}>
      {label}
    </Badge>
  );
}