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
