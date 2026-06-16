import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/shared/required-mark";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  id?: string;
  children: React.ReactNode;
  optional?: boolean;
  className?: string;
}

export function FieldLabel({
  htmlFor,
  id,
  children,
  optional,
  className,
}: FieldLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      id={id}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {children}
      {!optional ? <RequiredMark /> : null}
    </Label>
  );
}
