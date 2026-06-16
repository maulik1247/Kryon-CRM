"use client";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { AddLeadSheet } from "./add-lead-sheet";

export function PipelineToolbar() {
  return (
    <PageToolbar
      description="Drag deals across stages and keep opportunity value moving."
      actions={<AddLeadSheet />}
    />
  );
}
