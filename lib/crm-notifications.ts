import { toast } from "sonner";

export function notifyCreated(label: string, name?: string) {
  toast.success(`${label} added`, {
    description: name,
  });
}

export function notifyUpdated(label: string, name?: string) {
  toast.success(`${label} updated`, {
    description: name,
  });
}

export function notifyDeleted(label: string, name?: string) {
  toast.success(`${label} deleted`, {
    description: name,
  });
}

export function notifyError(title: string, description?: string) {
  toast.error(title, {
    description,
  });
}

export function notifyInfo(title: string, description?: string) {
  toast.message(title, {
    description,
  });
}
