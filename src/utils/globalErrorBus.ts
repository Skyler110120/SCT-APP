export interface GlobalErrorEvent {
  message: string;
  status?: number;
  path?: string;
  method?: string;
}

type Listener = (event: GlobalErrorEvent) => void;

const listeners = new Set<Listener>();

export function emitGlobalError(event: GlobalErrorEvent): void {
  listeners.forEach((listener) => listener(event));
}

export function subscribeGlobalError(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
