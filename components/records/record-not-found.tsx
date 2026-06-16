import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecordNotFoundProps {
  backHref: string;
  backLabel: string;
  message?: string;
}

export function RecordNotFound({
  backHref,
  backLabel,
  message = "This record could not be found or you do not have access.",
}: RecordNotFoundProps) {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" asChild>
        <Link href={backHref}>← Back to {backLabel}</Link>
      </Button>
    </div>
  );
}
