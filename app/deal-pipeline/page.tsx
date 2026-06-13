import { AppShell } from "@/components/layout/app-shell";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { PipelineToolbar } from "@/components/pipeline/pipeline-toolbar";

export default function DealPipelinePage() {
  return (
    <AppShell title="Deals" toolbar={<PipelineToolbar />}>
      <KanbanBoard />
    </AppShell>
  );
}
