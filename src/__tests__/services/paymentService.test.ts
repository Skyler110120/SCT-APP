import { paymentService } from "../../services/paymentService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("paymentService.syncCheckoutSession", () => {
  it("posts checkout session ID for backend sync", async () => {
    mockApiFetch.mockResolvedValueOnce({ ok: true, message: "synced" });
    const result = await paymentService.syncCheckoutSession("sess_123");
    expect(result.ok).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/checkout/sync-session", {
      method: "POST",
      body: JSON.stringify({ session_id: "sess_123" }),
    });
  });
});

describe("paymentService.checkout + portal helpers", () => {
  it("creates subscription checkout for a course", async () => {
    mockApiFetch.mockResolvedValueOnce({
      checkout_url: "https://checkout.stripe.com/s/test",
      session_id: "sess_abc",
      subscription_id: 9,
    });

    const result = await paymentService.createSubscriptionCheckout(7);
    expect(result.checkout_url).toContain("stripe.com");
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/checkout/subscription", {
      method: "POST",
      body: JSON.stringify({ course_id: 7 }),
    });
  });

  it("returns billing portal URL", async () => {
    mockApiFetch.mockResolvedValueOnce({
      portal_url: "https://billing.stripe.com/p/session",
    });

    const result = await paymentService.getPortalUrl();
    expect(result.portal_url).toContain("stripe.com");
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/portal");
  });
});

describe("paymentService admin helpers", () => {
  it("loads company ledger", async () => {
    mockApiFetch.mockResolvedValueOnce({
      summary: {
        payment_count: 1,
        gross_amount_cents: 20000,
        platform_fee_cents: 3000,
        company_payout_cents: 17000,
      },
      payments: [],
    });

    const result = await paymentService.getCompanyLedger();
    expect(result.summary.payment_count).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/admin/company-ledger");
  });

  it("posts refund requests for admin payments", async () => {
    mockApiFetch.mockResolvedValueOnce({
      status: "refunded",
      payment_id: 10,
      stripe_refund_id: "re_123",
    });

    const result = await paymentService.refundPayment(10);
    expect(result.status).toBe("refunded");
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/admin/refund", {
      method: "POST",
      body: JSON.stringify({ payment_id: 10 }),
    });
  });
});

// ---------------------------------------------------------------------------
// Stripe Connect (admin) onboarding endpoints
// ---------------------------------------------------------------------------

describe("paymentService.connect", () => {
  it("starts onboarding for a given company", async () => {
    mockApiFetch.mockResolvedValueOnce({
      url: "https://connect.stripe.com/setup/acct_123",
      stripe_account_id: "acct_123",
    });

    const result = await paymentService.createConnectOnboarding(42);

    expect(result.url).toContain("stripe.com");
    expect(result.stripe_account_id).toBe("acct_123");
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/connect/onboard", {
      method: "POST",
      body: JSON.stringify({ company_id: 42 }),
    });
  });

  it("fetches connect status for a given company", async () => {
    mockApiFetch.mockResolvedValueOnce({
      company_id: 7,
      stripe_account_id: "acct_active",
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
      requirements_currently_due: [],
      requirements_eventually_due: [],
      requirements_past_due: [],
      payment_enabled: true,
    });

    const result = await paymentService.getConnectStatus(7);

    expect(result.payouts_enabled).toBe(true);
    expect(result.charges_enabled).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/connect/status/7");
  });
});

// ---------------------------------------------------------------------------
// Student subscription lifecycle
// ---------------------------------------------------------------------------

describe("paymentService.subscription lifecycle", () => {
  it("creates subscription checkout with explicit redirect URLs", async () => {
    mockApiFetch.mockResolvedValueOnce({
      checkout_url: "https://checkout.stripe.com/s/sub",
      session_id: "sess_sub",
      subscription_id: 12,
    });

    await paymentService.createSubscriptionCheckout(7, {
      successUrl: "myapp://payment-success",
      cancelUrl: "myapp://payment-cancel",
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/payments/checkout/subscription", {
      method: "POST",
      body: JSON.stringify({
        course_id: 7,
        success_url: "myapp://payment-success",
        cancel_url: "myapp://payment-cancel",
      }),
    });
  });

  it("cancels an active subscription", async () => {
    mockApiFetch.mockResolvedValueOnce({ status: "cancel_scheduled" });

    const result = await paymentService.cancelSubscription();

    expect(result.status).toBe("cancel_scheduled");
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/subscription/cancel", {
      method: "POST",
    });
  });

  it("reactivates a cancelled subscription", async () => {
    mockApiFetch.mockResolvedValueOnce({ status: "active" });

    const result = await paymentService.reactivateSubscription();

    expect(result.status).toBe("active");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/payments/subscription/reactivate",
      { method: "POST" }
    );
  });

  it("fetches subscription status from server", async () => {
    mockApiFetch.mockResolvedValueOnce({
      has_subscription: true,
      status: "active",
    });

    const result = await paymentService.getSubscriptionStatus();
    expect(result.has_subscription).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/subscription/status");
  });
});

// ---------------------------------------------------------------------------
// Makeup session checkout
// ---------------------------------------------------------------------------

describe("paymentService.createMakeupCheckout", () => {
  it("posts enrollment id for makeup-session checkout (no redirect URLs)", async () => {
    mockApiFetch.mockResolvedValueOnce({
      checkout_url: "https://checkout.stripe.com/s/mk",
      session_id: "sess_mk",
    });

    await paymentService.createMakeupCheckout(99);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/payments/checkout/makeup-session",
      {
        method: "POST",
        body: JSON.stringify({ enrollment_id: 99 }),
      }
    );
  });

  it("posts enrollment id and redirect URLs together when provided", async () => {
    mockApiFetch.mockResolvedValueOnce({
      checkout_url: "https://checkout.stripe.com/s/mk2",
      session_id: "sess_mk2",
    });

    await paymentService.createMakeupCheckout(99, {
      successUrl: "myapp://makeup-success",
      cancelUrl: "myapp://makeup-cancel",
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/payments/checkout/makeup-session",
      {
        method: "POST",
        body: JSON.stringify({
          enrollment_id: 99,
          success_url: "myapp://makeup-success",
          cancel_url: "myapp://makeup-cancel",
        }),
      }
    );
  });
});

// ---------------------------------------------------------------------------
// Billing portal + payment history
// ---------------------------------------------------------------------------

describe("paymentService.getPortalUrl + getPaymentHistory", () => {
  it("appends return_url query when provided", async () => {
    mockApiFetch.mockResolvedValueOnce({
      portal_url: "https://billing.stripe.com/p/session",
    });

    await paymentService.getPortalUrl("myapp://profile");

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/payments/portal?return_url=myapp%3A%2F%2Fprofile"
    );
  });

  it("omits return_url query when not provided", async () => {
    mockApiFetch.mockResolvedValueOnce({
      portal_url: "https://billing.stripe.com/p/session",
    });

    await paymentService.getPortalUrl();

    expect(mockApiFetch).toHaveBeenCalledWith("/payments/portal");
  });

  it("fetches student payment history", async () => {
    mockApiFetch.mockResolvedValueOnce({
      summary: { gross_amount_cents: 0, payment_count: 0 },
      payments: [],
    });

    const result = await paymentService.getPaymentHistory();
    expect(result.payments).toEqual([]);
    expect(mockApiFetch).toHaveBeenCalledWith("/payments/history");
  });
});
