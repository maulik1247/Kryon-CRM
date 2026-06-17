"use client";

import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const CRM_BOOTSTRAP_LOADING_STATES = [
  { text: "Verifying your session" },
  { text: "Connecting to workspace" },
  { text: "Loading customers & contacts" },
  { text: "Loading deals & pipeline" },
  { text: "Loading tasks & activities" },
  { text: "Syncing reminders" },
  { text: "Applying your permissions" },
  { text: "Preparing your dashboard" },
];

export function CrmBootstrapLoader({ loading }: { loading: boolean }) {
  return (
    <MultiStepLoader
      loadingStates={CRM_BOOTSTRAP_LOADING_STATES}
      loading={loading}
      duration={1200}
      loop
    />
  );
}
