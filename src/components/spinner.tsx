import { Loader2 } from "lucide-react";
import { useLang } from "@/components/lang-provider";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function PageLoader({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Spinner />
      <span>{label ?? t("loading")}</span>
    </div>
  );
}
