/**
 * Automatic error reporting to the SCT API (POST /client-errors).
 *
 * Errors are queued and sent in small batches, tagged source "mobile" with the
 * platform, app version and environment, so a dashboard can separate this app
 * from the web app. Repeats of the same error within a minute are dropped.
 * Reporting never throws and never reports its own failures.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import { API_URL, APP_ENV } from "../config";
import { authStorage } from "./authStorage";

export type ClientErrorKind =
  | "crash"
  | "js_error"
  | "unhandled_rejection"
  | "network"
  | "timeout"
  | "server"
  | "auth"
  | "validation"
  | "unknown";

export interface ClientErrorInput {
  kind: ClientErrorKind;
  message: string;
  severity?: "info" | "warning" | "error";
  stack?: string;
  screen?: string;
  apiMethod?: string;
  apiPath?: string;
  httpStatus?: number;
}

interface QueuedEvent {
  source: "mobile";
  platform: string;
  app_version?: string;
  environment: string;
  kind: string;
  severity: string;
  message: string;
  stack?: string;
  fingerprint: string;
  screen?: string;
  api_method?: string;
  api_path?: string;
  http_status?: number;
  occurred_at: string;
}

export const CLIENT_ERRORS_PATH = "/client-errors";
const FLUSH_DELAY_MS = 3000;
const MAX_BATCH = 25;
const MAX_QUEUE = 100;
const DEDUPE_WINDOW_MS = 60_000;

const queue: QueuedEvent[] = [];
const recentFingerprints = new Map<string, number>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentScreen: string | undefined;

const appVersion: string | undefined =
  Constants?.expoConfig?.version ?? (Constants as any)?.nativeAppVersion ?? undefined;

/** Strip ids and query strings so "/companies/9?x=1" and "/companies/12" group together. */
function normalizeForFingerprint(value: string | undefined): string {
  return (value ?? "").split("?")[0].replace(/\d+/g, ":n");
}

function hash(input: string): string {
  // djb2: short, stable and dependency-free. Only used to group repeats.
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

export function setErrorReporterScreen(screen: string | undefined): void {
  currentScreen = screen;
}

export function reportClientError(input: ClientErrorInput): void {
  try {
    if (!input.message) return;
    const fingerprint = hash(
      [input.kind, input.message.slice(0, 200), normalizeForFingerprint(input.apiPath), input.httpStatus ?? ""].join("|")
    );
    const now = Date.now();
    const last = recentFingerprints.get(fingerprint);
    if (last && now - last < DEDUPE_WINDOW_MS) return;
    recentFingerprints.set(fingerprint, now);
    if (recentFingerprints.size > 500) recentFingerprints.clear();

    if (queue.length >= MAX_QUEUE) queue.shift();
    queue.push({
      source: "mobile",
      platform: Platform.OS,
      app_version: appVersion,
      environment: APP_ENV,
      kind: input.kind,
      severity: input.severity ?? "error",
      message: input.message.slice(0, 5000),
      stack: input.stack?.slice(0, 10000),
      fingerprint,
      screen: input.screen ?? currentScreen,
      api_method: input.apiMethod,
      api_path: input.apiPath,
      http_status: input.httpStatus,
      occurred_at: new Date(now).toISOString(),
    });
    scheduleFlush();
  } catch {
    // Reporting must never break the app.
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushClientErrors();
  }, FLUSH_DELAY_MS);
}

export async function flushClientErrors(): Promise<void> {
  if (!queue.length) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    const token = await authStorage.getAuthToken();
    // Plain fetch, not apiFetch: a failed report must not create another report.
    await fetch(`${API_URL}${CLIENT_ERRORS_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Offline or API down: drop this batch rather than retrying forever.
  }
  if (queue.length) scheduleFlush();
}

let installed = false;

/** Report uncaught JS errors and unhandled promise rejections. Call once at startup. */
export function installGlobalErrorHandlers(): void {
  if (installed) return;
  installed = true;

  const errorUtils = (globalThis as any).ErrorUtils;
  if (errorUtils?.setGlobalHandler) {
    const previous = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      reportClientError({
        kind: isFatal ? "crash" : "js_error",
        message: error?.message || String(error),
        stack: error?.stack,
      });
      // Send fatal errors right away; the app may be about to close.
      if (isFatal) void flushClientErrors();
      previous?.(error, isFatal);
    });
  }

  const rejectionOptions = {
    allRejections: true,
    onUnhandled: (_id: number, error: any) => {
      reportClientError({
        kind: "unhandled_rejection",
        severity: "warning",
        message: error?.message || String(error),
        stack: error?.stack,
      });
    },
    onHandled: () => {},
  };
  try {
    const hermes = (globalThis as any).HermesInternal;
    if (hermes?.hasPromise?.() && hermes.enablePromiseRejectionTracker) {
      // Hermes promises are native; the JS polyfill tracker would never see them.
      hermes.enablePromiseRejectionTracker(rejectionOptions);
    } else {
      require("promise/setimmediate/rejection-tracking").enable(rejectionOptions);
    }
  } catch {
    // Not available on this runtime; uncaught errors are still reported.
  }
}

/** Test helper. */
export function __resetErrorReporterForTests(): void {
  queue.length = 0;
  recentFingerprints.clear();
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
}

export function __getQueuedErrorsForTests(): QueuedEvent[] {
  return [...queue];
}
