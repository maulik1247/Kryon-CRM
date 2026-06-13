import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClickableCardProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ClickableCard({
  onClick,
  children,
  className,
}: ClickableCardProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto w-full p-0 font-normal transition-smooth hover:bg-transparent active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <Card className="w-full shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-border hover:bg-muted/40 hover:shadow-md">
        <CardContent className="flex items-center justify-between p-3">
          {children}
        </CardContent>
      </Card>
    </Button>
  );
}
