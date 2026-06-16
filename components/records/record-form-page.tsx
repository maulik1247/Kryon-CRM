import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecordFormPageProps {
  backHref: string;
  backLabel: string;
  title?: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function RecordFormPage({
  backHref,
  backLabel,
  title,
  description,
  onSubmit,
  footer,
  children,
}: RecordFormPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 text-muted-foreground"
          asChild
        >
          <Link href={backHref}>← {backLabel}</Link>
        </Button>
        {title ? (
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Card className="space-y-4 border-border/60 p-6 shadow-sm">
          {children}
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {footer}
        </div>
      </form>
    </div>
  );
}
