import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  return (
    <Avatar className={cn("h-7 w-7 border border-border/60 shadow-sm", className)}>
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-[10px] font-semibold text-primary",
          fallbackClassName
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
