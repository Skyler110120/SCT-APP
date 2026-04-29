export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'INCOMPLETE';
export type PaymentStatus = 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'REFUNDED';

export interface ConnectOnboardResponse {
  url: string;
  stripe_account_id: string;
}

export interface ConnectStatusResponse {
  company_id: number;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements_currently_due: string[];
  requirements_eventually_due: string[];
  requirements_past_due: string[];
  payment_enabled: boolean;
}

export interface SubscriptionCheckoutResponse {
  checkout_url: string;
  session_id: string;
  subscription_id: number;
}

export interface CheckoutSyncResponse {
  ok: boolean;
  message: string;
}

export interface SubscriptionStatusData {
  has_subscription: boolean;
  subscription_id?: number;
  status?: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  amount_cents: number;
  can_book_sessions: boolean;
  enrollment_phase?: string;
  make_up_sessions_remaining: number;
}

export interface CancelResponse {
  status: string;
  cancel_at_period_end: boolean;
  current_period_end?: string;
  message: string;
}

export interface ReactivateResponse {
  status: string;
  cancel_at_period_end: boolean;
  message: string;
}

export interface MakeupCheckoutResponse {
  checkout_url: string;
  session_id: string;
  amount_cents: number;
}

export interface PortalUrlResponse {
  portal_url: string;
}

export interface PaymentRecord {
  id: number;
  amount_cents: number;
  status: PaymentStatus;
  paid_at: string | null;
  stripe_invoice_id: string | null;
}

export interface PaymentHistoryData {
  payments: PaymentRecord[];
}

export interface CompanyLedgerSummary {
  payment_count: number;
  gross_amount_cents: number;
  platform_fee_cents: number;
  company_payout_cents: number;
}

export interface CompanyLedgerPayment {
  id: number;
  amount_cents: number;
  platform_fee_cents: number;
  company_payout_cents: number;
  status: PaymentStatus;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_type: "subscription_invoice" | "one_time";
  student_name: string;
  student_email: string;
  refund_eligible: boolean;
}

export interface CompanyLedgerData {
  summary: CompanyLedgerSummary;
  payments: CompanyLedgerPayment[];
}

export interface AdminRefundResponse {
  status: "refunded" | string;
  payment_id: number;
  stripe_refund_id: string;
}
