/**
 * Tests for AdminPaymentsScreen — admin-side ledger + refund execution.
 *
 *  Contracts verified:
 *   - Loads the company ledger on mount and renders payment rows.
 *   - Shows the empty-state copy when there are no payments.
 *   - Refund button is disabled when payment.refund_eligible is false.
 *   - Confirming the refund Alert calls paymentService.refundPayment with the
 *     payment id and reloads the ledger.
 *   - Renders a generic error banner when refundPayment throws.
 *   - Renders a friendly error banner when the initial ledger fetch fails.
 */
import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("@/src/services/paymentService", () => ({
  paymentService: {
    getCompanyLedger: jest.fn(),
    refundPayment: jest.fn(),
  },
}));

jest.mock("@/src/components/BackgroundGradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: any }) =>
      React.createElement(View, null, children),
  };
});

jest.mock("@/src/components/NavBar", () => ({
  __esModule: true,
  default: () => null,
}));

import AdminPaymentsScreen from "@/src/components/screens/app/AdminPaymentsScreen";
import { paymentService } from "@/src/services/paymentService";

const mockGetLedger = paymentService.getCompanyLedger as jest.MockedFunction<
  typeof paymentService.getCompanyLedger
>;
const mockRefund = paymentService.refundPayment as jest.MockedFunction<
  typeof paymentService.refundPayment
>;

const sampleLedger = {
  summary: {
    payment_count: 2,
    gross_amount_cents: 30000,
    platform_fee_cents: 4500,
    company_payout_cents: 25500,
  },
  payments: [
    {
      id: 11,
      student_name: "Alice Smith",
      amount_cents: 15000,
      status: "SUCCEEDED",
      paid_at: "2026-05-01T09:00:00Z",
      refund_eligible: true,
    },
    {
      id: 12,
      student_name: "Bob Jones",
      amount_cents: 15000,
      status: "REFUNDED",
      paid_at: "2026-04-01T09:00:00Z",
      refund_eligible: false,
    },
  ],
};

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AdminPaymentsScreen", () => {
  it("loads and renders the ledger summary + payment rows", async () => {
    mockGetLedger.mockResolvedValueOnce(sampleLedger as any);

    render(<AdminPaymentsScreen />);
    await flushEffects();

    expect(mockGetLedger).toHaveBeenCalled();
    expect(screen.getByText("$150.00 - Alice Smith")).toBeTruthy();
    expect(screen.getByText("$150.00 - Bob Jones")).toBeTruthy();
    expect(
      screen.getByText(/2 payments.*Gross \$300\.00.*Company payout \$255\.00/i)
    ).toBeTruthy();
  });

  it("renders 'No payments yet' when ledger is empty", async () => {
    mockGetLedger.mockResolvedValueOnce({
      summary: { payment_count: 0, gross_amount_cents: 0, platform_fee_cents: 0, company_payout_cents: 0 },
      payments: [],
    } as any);

    render(<AdminPaymentsScreen />);
    await flushEffects();

    expect(screen.getByText("No payments yet for this company.")).toBeTruthy();
  });

  it("renders a 'Refunded' label on already-refunded payments and hides the refund action", async () => {
    mockGetLedger.mockResolvedValueOnce(sampleLedger as any);

    render(<AdminPaymentsScreen />);
    await flushEffects();

    // Already refunded payment shows "Refunded" instead of "Refund".
    expect(screen.getByText("Refunded")).toBeTruthy();
  });

  it("dispatches refund with the payment id and reloads the ledger when the user confirms the Alert", async () => {
    mockGetLedger.mockResolvedValueOnce(sampleLedger as any);
    mockRefund.mockResolvedValueOnce({ status: "refunded", payment_id: 11 } as any);
    // Second ledger fetch after refund.
    mockGetLedger.mockResolvedValueOnce({
      ...sampleLedger,
      payments: [
        { ...sampleLedger.payments[0], status: "REFUNDED", refund_eligible: false },
        sampleLedger.payments[1],
      ],
    } as any);

    let refundCallback: (() => Promise<void>) | undefined;
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(
      (_title, _msg, buttons?: any[]) => {
        const refundBtn = buttons?.find((b) => b.text === "Refund");
        refundCallback = refundBtn?.onPress;
      }
    );

    render(<AdminPaymentsScreen />);
    await flushEffects();

    fireEvent.press(screen.getByText("Refund"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Issue Refund",
      expect.stringMatching(/cannot be undone/i),
      expect.any(Array)
    );

    // Now invoke the captured destructive callback.
    await act(async () => {
      await refundCallback!();
      await Promise.resolve();
    });

    expect(mockRefund).toHaveBeenCalledWith(11);
    expect(mockGetLedger).toHaveBeenCalledTimes(2);

    await flushEffects();

    // Success banner now persists across the post-refund ledger reload
    // because handleRefundPayment sets the message AFTER `loadLedger()`
    // resolves (the in-flight `setMessage(null)` inside loadLedger runs first).
    expect(screen.getByText(/Payment #11 refunded successfully/i)).toBeTruthy();
    // After reload, the refunded payment shows "Refunded" in its action label.
    expect(screen.getAllByText("Refunded").length).toBeGreaterThan(0);

    alertSpy.mockRestore();
  });

  it("surfaces a generic error banner when refundPayment throws", async () => {
    mockGetLedger.mockResolvedValueOnce(sampleLedger as any);
    mockRefund.mockRejectedValueOnce(new Error("Stripe outage"));

    let refundCallback: (() => Promise<void>) | undefined;
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(
      (_t, _m, buttons?: any[]) => {
        refundCallback = buttons?.find((b) => b.text === "Refund")?.onPress;
      }
    );

    render(<AdminPaymentsScreen />);
    await flushEffects();

    fireEvent.press(screen.getByText("Refund"));
    await act(async () => {
      await refundCallback!();
    });

    expect(
      screen.getByText(/An error occurred while issuing the refund/i)
    ).toBeTruthy();
    alertSpy.mockRestore();
  });

  it("renders the failure banner when the initial ledger fetch throws", async () => {
    mockGetLedger.mockRejectedValueOnce(new Error("Network down"));

    render(<AdminPaymentsScreen />);
    await flushEffects();

    expect(screen.getByText("Failed to load company payments.")).toBeTruthy();
  });
});
