"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCrmData } from "@/lib/crm-data-provider";
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/lib/crm-notifications";
import type { MasterDataListKey } from "@/lib/types";

interface MasterDataListEditorProps {
  title: string;
  description: string;
  listKey: MasterDataListKey;
}

export function MasterDataListEditor({
  title,
  description,
  listKey,
}: MasterDataListEditorProps) {
  const {
    masterData,
    addMasterDataItem,
    removeMasterDataItem,
    renameMasterDataItem,
  } = useCrmData();
  const [newValue, setNewValue] = React.useState("");
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState("");
  const [error, setError] = React.useState("");

  const items = masterData[listKey];

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const added = addMasterDataItem(listKey, newValue);
    if (!added) {
      const message = "Enter a unique value to add.";
      setError(message);
      notifyError("Could not add option", message);
      return;
    }

    notifyCreated(title, newValue.trim());
    setNewValue("");
  };

  const handleRename = (oldValue: string) => {
    setError("");
    const renamed = renameMasterDataItem(listKey, oldValue, editDraft);
    if (!renamed) {
      const message = "Could not rename. Check for duplicates or empty values.";
      setError(message);
      notifyError("Could not rename option", message);
      return;
    }
    notifyUpdated(title, editDraft.trim());
    setEditingValue(null);
    setEditDraft("");
  };

  const handleRemove = (value: string) => {
    setError("");
    const removed = removeMasterDataItem(listKey, value);
    if (!removed) {
      const message = "Keep at least one option in each list.";
      setError(message);
      notifyError("Could not remove option", message);
      return;
    }
    notifyDeleted(title, value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            placeholder={`Add ${title.toLowerCase()}`}
          />
          <Button type="submit" variant="outline">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>

        <ul className="divide-y rounded-md border">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between gap-2 px-3 py-2"
            >
              {editingValue === item ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                    className="h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleRename(item)}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingValue(null);
                      setEditDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm">{item}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingValue(item);
                        setEditDraft(item);
                      }}
                      aria-label={`Edit ${item}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={items.length <= 1}
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${item}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
