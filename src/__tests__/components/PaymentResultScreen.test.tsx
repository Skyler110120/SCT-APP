/**
 * Tests for PaymentResultScreen — the return route from Stripe Checkout.
 *
 * Critical contracts validated here:
 *   - Subscription success path calls paymentService.syncCheckoutSession to
 *     reconcile the new subscription on the server before redirecting.
 *   - Make-up payment success path SKIPS sync (the webhook covers it).
 *   - Cancel path does NOT sync.
 *   - Success path schedules a redirect to /dashboard after the timer fires.
 *   - Errors from syncCheckoutSession are surfaced in the UI.
 *   - Pressing "Go to Dashboard" navigates immediately.
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

// Pathname + params are injected dynamically per test via the mocked module.
let mockPathname = "/payment-success";
let mockParams: Record<string, string | undefined> = {};

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
  useLocalSearchParams: () => mockParams,
  usePathname: () => mockPathname,
}));

jest.mock("@/src/services/paymentService", () => ({
  paymentService: {
    syncCheckoutSession: jest.fn(),
  },
}));

jest.mock("@/src/components/BackgroundGradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: function BackgroundGradient({ children }: { children: any }) {
      return React.createElement(View, null, children);
    },
  };
});

import { router } from "expo-router";
import { paymentService } from "@/src/services/paymentService";
import PaymentResultScreen from "@/src/components/screens/app/PaymentResultScreen";

const mockReplace = router.replace as jest.MockedFunction<typeof router.replace>;
const mockSync = paymentService.syncCheckoutSession as jest.MockedFunction<
  typeof paymentService.syncCheckoutSession
>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockParams = {};
});

afterEach(() => {
  jest.useRealTimers();
});

async function flush() {
  // Drain microtasks for useEffect promises.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("PaymentResultScreen — subscription success", () => {
  it("syncs the checkout session id on mount", async () => {
    mockPathname = "/payment-success";
    mockParams = { session_id: "cs_test_123" };
    mockSync.mockResolvedValueOnce({ ok: true } as any);

    render(<PaymentResultScreen />);
    await flush();

    expect(mockSync).toHaveBeenCalledWith("cs_test_123");
    expect(screen.getByText("Payment Successful")).toBeTruthy();
    expect(
      screen.getByText(/Your subscription is active/i)
    ).toBeTruthy();
  });

  it("does NOT call sync when no session_id query param is present", async () => {
    mockPathname = "/payment-success";
    mockParams = {};

    render(<PaymentResultScreen />);
    await flush();

    expect(mockSync).not.toHaveBeenCalled();
  });

  it("redirects to /dashboard after the 5s success timer fires", async () => {
    mockPathname = "/payment-success";
    mockParams = {};

    render(<PaymentResultScreen />);
    await flush();

    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("surfaces a sync error to the UI", async () => {
    mockPathname = "/payment-success";
    mockParams = { session_id: "cs_fail" };
    mockSync.mockRejectedValueOnce(new Error("Server unavailable"));

    render(<PaymentResultScreen />);
    await flush();

    expect(screen.getByText("Server unavailable")).toBeTruthy();
  });
});

describe("PaymentResultScreen — makeup success", () => {
  it("does NOT call syncCheckoutSession on the makeup success path", async () => {
    mockPathname = "/makeup-payment-success";
    mockParams = { session_id: "cs_mk_1" };

    render(<PaymentResultScreen />);
    await flush();

    expect(mockSync).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Your make-up session payment is confirmed/i)
    ).toBeTruthy();
  });

  it("also redirects to /dashboard on the makeup success path", async () => {
    mockPathname = "/makeup-payment-success";
    mockParams = {};

    render(<PaymentResultScreen />);
    await flush();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});

describe("PaymentResultScreen — cancel paths", () => {
  it("does NOT sync and does NOT auto-redirect on /payment-cancel", async () => {
    mockPathname = "/payment-cancel";
    mockParams = { session_id: "cs_x" };

    render(<PaymentResultScreen />);
    await flush();

    expect(mockSync).not.toHaveBeenCalled();
    expect(screen.getByText("Payment Cancelled")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("PaymentResultScreen — explicit dashboard button", () => {
  it("redirects on the explicit 'Go to Dashboard' press", async () => {
    mockPathname = "/payment-cancel";
    mockParams = {};

    render(<PaymentResultScreen />);
    await flush();

    fireEvent.press(screen.getByText("Go to Dashboard"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
