"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface DeleteRecordButtonProps {
  title: string;
  description: string;
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  className?: string;
}

export function DeleteRecordButton({
  title,
  description,
  onConfirm,
  label = "Delete",
  confirmLabel = "Delete",
  className,
}: DeleteRecordButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
}
