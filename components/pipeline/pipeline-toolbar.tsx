"use client";

import Link from "next/link";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { recordNewRoutes } from "@/lib/record-routes";

export function PipelineToolbar() {
  return (
    <PageToolbar
      description="Drag deals across stages and keep opportunity value moving."
      actions={
        <Button className="gap-2 shadow-sm" asChild>
          <Link href={recordNewRoutes.deal}>
            <Plus className="h-4 w-4" />
            Create Deal
          </Link>
        </Button>
      }
    />
  );
}
