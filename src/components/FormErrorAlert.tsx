import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormErrorAlertProps {
  message: string | null;
  title?: string;
  className?: string;
}

export function FormErrorAlert({
  message,
  title = "Não foi possível concluir a ação",
  className,
}: FormErrorAlertProps) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
