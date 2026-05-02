export interface GlobalErrorEvent {
  message: string;
  title?: string;
  kind?: "network" | "timeout" | "auth" | "server" | "validation" | "unknown";
  severity?: "info" | "warning" | "error";
  canRetry?: boolean;
  status?: number;
  path?: string;
  method?: string;
  dedupeKey?: string;
  timestamp?: number;
}

type Listener = (event: GlobalErrorEvent) => void;

const listeners = new Set<Listener>();

export function emitGlobalError(event: GlobalErrorEvent): void {
  const payload: GlobalErrorEvent = {
    severity: "error",
    kind: "unknown",
    timestamp: Date.now(),
    ...event,
  };
  listeners.forEach((listener) => listener(payload));
}

export function subscribeGlobalError(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
