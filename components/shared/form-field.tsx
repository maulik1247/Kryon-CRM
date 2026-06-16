import { Label } from "@/components/ui/label";
import { InfoTip } from "@/components/shared/info-tip";
import { RequiredMark } from "@/components/shared/required-mark";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  info?: string;
  optional?: boolean;
}

export function FormField({
  label,
  htmlFor,
  children,
  className,
  info,
  optional,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={htmlFor} className="inline-flex items-center gap-0.5">
          {label}
          {!optional ? <RequiredMark /> : null}
        </Label>
        {optional ? (
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        ) : null}
        {info ? <InfoTip content={info} label={`About ${label}`} /> : null}
      </div>
      {children}
    </div>
  );
}
