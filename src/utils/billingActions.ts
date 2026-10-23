import type { SubscriptionStatusData } from "@/src/types/payment.types";

export interface BillingActions {
  statusLabel: string | null;
  canSubscribe: boolean;
  subscribeLabel: string;
  canBuyClass: boolean;
  canOpenPortal: boolean;
  canCancel: boolean;
  canReactivate: boolean;
  showPastDueWarning: boolean;
}

const PAY_PER_CLASS_PHASES = new Set(["POST_SUBSCRIPTION", "MAKEUP_PAID"]);

/**
 * Mirrors the API's billing rules so the app never offers an action the server will reject
 * (e.g. a second checkout while PAST_DUE would create a duplicate subscription).
 */
export function getBillingActions(status: SubscriptionStatusData | null): BillingActions {
  const subStatus = status?.subscription_id != null ? status.status : undefined;
  const phase = status?.enrollment_phase ?? "";
  const payPerClass = PAY_PER_CLASS_PHASES.has(phase);
  const cancelAtPeriodEnd = status?.cancel_at_period_end === true;

  let statusLabel: string | null = null;
  if (subStatus === "ACTIVE") {
    statusLabel = cancelAtPeriodEnd ? "Cancelling at period end" : "Active";
  } else if (subStatus === "PAST_DUE") {
    statusLabel = "Past due — update payment method";
  } else if (subStatus === "CANCELLED") {
    statusLabel = "Cancelled";
  } else if (subStatus === "INCOMPLETE") {
    statusLabel = "Incomplete — checkout not finished";
  }

  const canSubscribe =
    !payPerClass &&
    (subStatus === undefined || subStatus === "INCOMPLETE" || subStatus === "CANCELLED");

  return {
    statusLabel,
    canSubscribe,
    subscribeLabel:
      subStatus === "INCOMPLETE"
        ? "Complete Subscription"
        : subStatus === "CANCELLED"
        ? "Subscribe Again"
        : "Subscribe with Card",
    canBuyClass: payPerClass,
    canOpenPortal: subStatus === "ACTIVE" || subStatus === "PAST_DUE",
    canCancel: subStatus === "ACTIVE" && !cancelAtPeriodEnd,
    canReactivate: subStatus === "ACTIVE" && cancelAtPeriodEnd,
    showPastDueWarning: subStatus === "PAST_DUE",
  };
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const detail = (error as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
