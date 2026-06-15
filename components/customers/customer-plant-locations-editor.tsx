"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerPlantLocationsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CustomerPlantLocationsEditor({
  value,
  onChange,
}: CustomerPlantLocationsEditorProps) {
  const locations = value.length > 0 ? value : [""];

  const updateLocation = (index: number, next: string) => {
    const updated = [...locations];
    updated[index] = next;
    onChange(updated);
  };

  const addLocation = () => {
    onChange([...locations, ""]);
  };

  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    onChange(updated.length > 0 ? updated : [""]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Factory and plant sites for this customer.
      </p>

      <div className="space-y-2">
        <Label>Plant locations</Label>
        {locations.map((location, index) => (
          <div key={`plant-${index}`} className="flex gap-2">
            <Input
              value={location}
              placeholder="City, state"
              onChange={(e) => updateLocation(index, e.target.value)}
            />
            {locations.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeLocation(index)}
                aria-label={`Remove plant location ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addLocation}>
        <Plus className="h-4 w-4" />
        Add location
      </Button>
    </div>
  );
}
