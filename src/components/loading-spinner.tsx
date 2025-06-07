import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
}

export function LoadingSpinner({ message, className, spinnerClassName, textClassName }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <Loader2 className={cn("h-12 w-12 animate-spin text-primary", spinnerClassName)} />
      {message && <p className={cn("text-lg text-muted-foreground font-medium", textClassName)}>{message}</p>}
    </div>
  );
}
