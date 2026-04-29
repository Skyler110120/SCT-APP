import { apiFetch } from './api';
import type {
  ConnectOnboardResponse,
  ConnectStatusResponse,
  SubscriptionCheckoutResponse,
  SubscriptionStatusData,
  CancelResponse,
  ReactivateResponse,
  MakeupCheckoutResponse,
  PortalUrlResponse,
  PaymentHistoryData,
  CheckoutSyncResponse,
  CompanyLedgerData,
  AdminRefundResponse,
} from '../types/payment.types';

export const paymentService = {
  // ── Connect Onboarding (Admin) ────────────────────────────

  async createConnectOnboarding(companyId: number): Promise<ConnectOnboardResponse> {
    return apiFetch<ConnectOnboardResponse>('/payments/connect/onboard', {
      method: 'POST',
      body: JSON.stringify({ company_id: companyId }),
    });
  },

  async getConnectStatus(companyId: number): Promise<ConnectStatusResponse> {
    return apiFetch<ConnectStatusResponse>(`/payments/connect/status/${companyId}`);
  },

  // ── Student Subscription ──────────────────────────────────

  async createSubscriptionCheckout(courseId: number): Promise<SubscriptionCheckoutResponse> {
    return apiFetch<SubscriptionCheckoutResponse>('/payments/checkout/subscription', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async syncCheckoutSession(sessionId: string): Promise<CheckoutSyncResponse> {
    return apiFetch<CheckoutSyncResponse>('/payments/checkout/sync-session', {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatusData> {
    return apiFetch<SubscriptionStatusData>('/payments/subscription/status');
  },

  async cancelSubscription(): Promise<CancelResponse> {
    return apiFetch<CancelResponse>('/payments/subscription/cancel', {
      method: 'POST',
    });
  },

  async reactivateSubscription(): Promise<ReactivateResponse> {
    return apiFetch<ReactivateResponse>('/payments/subscription/reactivate', {
      method: 'POST',
    });
  },

  // ── Makeup Sessions ───────────────────────────────────────

  async createMakeupCheckout(enrollmentId: number): Promise<MakeupCheckoutResponse> {
    return apiFetch<MakeupCheckoutResponse>('/payments/checkout/makeup-session', {
      method: 'POST',
      body: JSON.stringify({ enrollment_id: enrollmentId }),
    });
  },

  // ── Billing Portal ────────────────────────────────────────

  async getPortalUrl(): Promise<PortalUrlResponse> {
    return apiFetch<PortalUrlResponse>('/payments/portal');
  },

  // ── Payment History ───────────────────────────────────────

  async getPaymentHistory(): Promise<PaymentHistoryData> {
    return apiFetch<PaymentHistoryData>('/payments/history');
  },

  async getCompanyLedger(): Promise<CompanyLedgerData> {
    return apiFetch<CompanyLedgerData>('/payments/admin/company-ledger');
  },

  async refundPayment(paymentId: number): Promise<AdminRefundResponse> {
    return apiFetch<AdminRefundResponse>('/payments/admin/refund', {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId }),
    });
  },
};
