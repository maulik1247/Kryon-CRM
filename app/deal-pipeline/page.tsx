import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { KanbanBoardSkeleton } from "@/components/pipeline/kanban-board-skeleton";
import { PipelineToolbar } from "@/components/pipeline/pipeline-toolbar";

const KanbanBoard = dynamic(
  () =>
    import("@/components/pipeline/kanban-board").then((mod) => mod.KanbanBoard),
  {
    loading: () => <KanbanBoardSkeleton />,
    ssr: false,
  }
);

export default function DealPipelinePage() {
  return (
    <AppShell title="Deals" toolbar={<PipelineToolbar />}>
      <KanbanBoard />
    </AppShell>
  );
}
