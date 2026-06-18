import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";

export const recordIdClassName =
  "whitespace-nowrap font-mono text-xs text-muted-foreground";

export function RecordIdText({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return <span className={cn(recordIdClassName, className)}>{id}</span>;
}

export function ReadOnlyIdField({
  label,
  id,
  htmlFor,
}: {
  label: string;
  id: string;
  htmlFor: string;
}) {
  return (
    <FormField label={label} htmlFor={htmlFor}>
      <Input
        id={htmlFor}
        value={id}
        readOnly
        className="bg-muted/30 font-mono"
      />
    </FormField>
  );
}
