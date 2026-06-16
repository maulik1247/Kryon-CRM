"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

function formatTimeLabel(value: string) {
  const [hour, minute] = value.split(":");
  if (!hour || !minute) return value;

  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    { value, onChange, placeholder = "Pick a time", disabled, ...props },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [hour, minute] = value?.split(":") ?? ["", ""];

    const updateTime = (nextHour: string, nextMinute: string) => {
      if (nextHour && nextMinute) {
        onChange(`${nextHour}:${nextMinute}`);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            {...props}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? formatTimeLabel(value) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={hour || undefined}
              onValueChange={(nextHour) =>
                updateTime(nextHour, minute || "00")
              }
            >
              <SelectTrigger aria-label="Hour">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {HOURS.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={minute || undefined}
              onValueChange={(nextMinute) =>
                updateTime(hour || "09", nextMinute)
              }
            >
              <SelectTrigger aria-label="Minute">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {MINUTES.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
TimePicker.displayName = "TimePicker";
