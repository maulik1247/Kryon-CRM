"use client";

import * as React from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrmData } from "@/lib/crm-data-provider";
import { getStageColumnStyle } from "@/lib/pipeline-styles";

const PRESET_COLORS = [
  "#f43f5e",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#14b8a6",
  "#10b981",
  "#737373",
];

export function ManageStagesDialog() {
  const {
    pipelineStages,
    deals,
    addPipelineStage,
    updatePipelineStage,
    removePipelineStage,
  } = useCrmData();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(PRESET_COLORS[0]);
  const [error, setError] = React.useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Stage name is required");
      return;
    }
    addPipelineStage(name, color);
    setName("");
    setColor(PRESET_COLORS[0]);
    setError("");
  };

  const handleRemove = (stageId: string) => {
    const removed = removePipelineStage(stageId);
    if (!removed) {
      setError("Remove all deals from a stage before deleting it");
    } else {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Manage Stages
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pipeline Stages</DialogTitle>
          <DialogDescription>
            Add stages and pick colors. Kanban swimlanes update automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-3 rounded-lg border p-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Add stage
          </Label>
          <Input
            placeholder="Stage name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Label htmlFor="stage-color" className="shrink-0 text-sm">
              Color
            </Label>
            <input
              id="stage-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-input bg-background"
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: preset }}
                  onClick={() => setColor(preset)}
                  aria-label={`Use color ${preset}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Stage
          </Button>
        </form>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Current stages
          </Label>
          {pipelineStages.map((stage) => {
            const dealCount = deals.filter((d) => d.stage === stage.id).length;
            return (
              <div
                key={stage.id}
                className="flex items-center gap-3 rounded-lg border p-3"
                style={getStageColumnStyle(stage.color)}
              >
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) =>
                    updatePipelineStage(stage.id, { color: e.target.value })
                  }
                  className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border/60 bg-background"
                  aria-label={`Color for ${stage.name}`}
                />
                <Input
                  value={stage.name}
                  onChange={(e) =>
                    updatePipelineStage(stage.id, { name: e.target.value })
                  }
                  className="h-8 border-border/60 bg-background/80"
                />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dealCount}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={pipelineStages.length <= 1 || dealCount > 0}
                  onClick={() => handleRemove(stage.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
