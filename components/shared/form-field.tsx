import { Label } from "@/components/ui/label";
import { InfoTip } from "@/components/shared/info-tip";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  info?: string;
}

export function FormField({
  label,
  htmlFor,
  children,
  className,
  info,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {info ? <InfoTip content={info} label={`About ${label}`} /> : null}
      </div>
      {children}
    </div>
  );
}
