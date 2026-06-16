import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecordPageShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
}

export function RecordPageShell({
  backHref,
  backLabel,
  title,
  subtitle,
  onEdit,
  editLabel = "Quick edit",
  children,
}: RecordPageShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            asChild
          >
            <Link href={backHref}>← {backLabel}</Link>
          </Button>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {onEdit ? (
          <Button type="button" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            {editLabel}
          </Button>
        ) : null}
      </div>
      <Card className="border-border/60 p-6 shadow-sm">{children}</Card>
    </div>
  );
}
