"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function PipelineStagesAdmin() {
  const {
    pipelineStages,
    deals,
    addPipelineStage,
    updatePipelineStage,
    removePipelineStage,
  } = useCrmData();
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(PRESET_COLORS[0]);
  const [error, setError] = React.useState("");

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Stage name is required.");
      return;
    }
    addPipelineStage(name, color);
    setName("");
    setColor(PRESET_COLORS[0]);
    setError("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">Pipeline Stages</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure deal pipeline swimlanes. Changes apply across the kanban.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Stage name"
            className="max-w-xs"
          />
          <div className="flex gap-1">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="h-9 w-9 rounded-md border-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: preset,
                  borderColor: color === preset ? "#000" : "transparent",
                }}
                onClick={() => setColor(preset)}
                aria-label={`Color ${preset}`}
              />
            ))}
          </div>
          <Button type="submit" variant="outline">
            <Plus className="h-4 w-4" />
            Add stage
          </Button>
        </form>

        <ul className="divide-y rounded-md border">
          {pipelineStages.map((stage) => {
            const dealCount = deals.filter(
              (deal) => deal.stage === stage.id
            ).length;

            return (
              <li
                key={stage.id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={getStageColumnStyle(stage.color)}
                  />
                  <Input
                    defaultValue={stage.name}
                    className="h-8 max-w-xs"
                    onBlur={(event) =>
                      updatePipelineStage(stage.id, {
                        name: event.target.value,
                      })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {dealCount} deal{dealCount === 1 ? "" : "s"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={pipelineStages.length <= 1 || dealCount > 0}
                  onClick={() => {
                    const removed = removePipelineStage(stage.id);
                    if (!removed) {
                      setError(
                        "Remove deals from a stage before deleting it."
                      );
                    } else {
                      setError("");
                    }
                  }}
                  aria-label={`Remove ${stage.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
