import { isCrmApiEnabled } from "@/lib/crm-api";
import { notifyError } from "@/lib/crm-notifications";

let mutationQueue: Promise<void> = Promise.resolve();

export function fireCrmApi(
  label: string,
  requestFn: () => Promise<unknown>,
  onError?: () => void
) {
  if (!isCrmApiEnabled()) return;

  mutationQueue = mutationQueue
    .then(() => requestFn())
    .catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Save failed";
      notifyError(`Failed to save ${label}`, message);
      onError?.();
    })
    .then(() => undefined);
}
