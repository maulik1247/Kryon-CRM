import { AppShell } from "@/components/layout/app-shell";
import { ActivityForm } from "@/components/pipeline/activity-form";

export default function NewActivityPage() {
  return (
    <AppShell title="Log Activity">
      <ActivityForm />
    </AppShell>
  );
}
