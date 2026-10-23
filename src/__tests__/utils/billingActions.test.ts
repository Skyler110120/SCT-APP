import { apiErrorMessage, getBillingActions } from "../../utils/billingActions";
import type { SubscriptionStatusData } from "../../types/payment.types";

const base: SubscriptionStatusData = {
  has_subscription: false,
  cancel_at_period_end: false,
  amount_cents: 20000,
  can_book_sessions: false,
  make_up_sessions_remaining: 0,
};

describe("getBillingActions", () => {
  it("offers subscribe only when there is no subscription", () => {
    const actions = getBillingActions(base);
    expect(actions.canSubscribe).toBe(true);
    expect(actions.subscribeLabel).toBe("Subscribe with Card");
    expect(actions.canOpenPortal).toBe(false);
    expect(actions.canCancel).toBe(false);
    expect(actions.statusLabel).toBeNull();
  });

  it("treats a null status (load failed) as not subscribed", () => {
    expect(getBillingActions(null).canSubscribe).toBe(true);
  });

  it("active subscription: portal + cancel, no subscribe", () => {
    const actions = getBillingActions({
      ...base,
      has_subscription: true,
      subscription_id: 1,
      status: "ACTIVE",
      can_book_sessions: true,
    });
    expect(actions.canSubscribe).toBe(false);
    expect(actions.canOpenPortal).toBe(true);
    expect(actions.canCancel).toBe(true);
    expect(actions.canReactivate).toBe(false);
    expect(actions.statusLabel).toBe("Active");
  });

  it("cancelling at period end: reactivate instead of cancel", () => {
    const actions = getBillingActions({
      ...base,
      has_subscription: true,
      subscription_id: 1,
      status: "ACTIVE",
      cancel_at_period_end: true,
    });
    expect(actions.canCancel).toBe(false);
    expect(actions.canReactivate).toBe(true);
    expect(actions.statusLabel).toBe("Cancelling at period end");
  });

  it("past due: portal + warning, never a second checkout", () => {
    const actions = getBillingActions({
      ...base,
      has_subscription: true,
      subscription_id: 1,
      status: "PAST_DUE",
    });
    expect(actions.canSubscribe).toBe(false);
    expect(actions.canOpenPortal).toBe(true);
    expect(actions.showPastDueWarning).toBe(true);
    expect(actions.canCancel).toBe(false);
  });

  it("incomplete: resume checkout, no portal", () => {
    const actions = getBillingActions({ ...base, subscription_id: 1, status: "INCOMPLETE" });
    expect(actions.canSubscribe).toBe(true);
    expect(actions.subscribeLabel).toBe("Complete Subscription");
    expect(actions.canOpenPortal).toBe(false);
  });

  it("cancelled: subscribe again, no portal or cancel", () => {
    const actions = getBillingActions({ ...base, subscription_id: 1, status: "CANCELLED" });
    expect(actions.canSubscribe).toBe(true);
    expect(actions.subscribeLabel).toBe("Subscribe Again");
    expect(actions.canOpenPortal).toBe(false);
    expect(actions.canCancel).toBe(false);
  });

  it.each(["POST_SUBSCRIPTION", "MAKEUP_PAID"])(
    "%s phase: pay-per-class only",
    (phase) => {
      const actions = getBillingActions({
        ...base,
        subscription_id: 1,
        status: "CANCELLED",
        enrollment_phase: phase,
      });
      expect(actions.canBuyClass).toBe(true);
      expect(actions.canSubscribe).toBe(false);
    }
  );
});

describe("apiErrorMessage", () => {
  it("prefers the server detail", () => {
    expect(
      apiErrorMessage({ detail: "This range has not completed Stripe Connect payment setup." }, "x")
    ).toBe("This range has not completed Stripe Connect payment setup.");
  });

  it("falls back to message, then the default", () => {
    expect(apiErrorMessage(new Error("Cannot reach the server."), "x")).toBe(
      "Cannot reach the server."
    );
    expect(apiErrorMessage(undefined, "Failed")).toBe("Failed");
  });
});
