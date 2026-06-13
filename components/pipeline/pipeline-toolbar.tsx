"use client";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { AddLeadDialog } from "./add-lead-dialog";

export function PipelineToolbar() {
  return (
    <PageToolbar
      description="Drag deals across stages and keep opportunity value moving."
      actions={<AddLeadDialog />}
    />
  );
}
