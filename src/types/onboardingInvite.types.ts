import { ApiResponse } from "./auth.types";

export interface OnboardingInviteCreateRequest {
  email: string;
  role: string;
  course_id?: number | null;
}

export interface OnboardingInviteCreateResponse {
  invite_id: number;
  status: string;
  web_join_url: string;
  mobile_join_url: string;
  expires_in_days: number;
}

export interface OnboardingInviteListItem {
  id: number;
  target_email?: string | null;
  target_role: string;
  invite_status: string;
  created_at: string;
  course_id?: number | null;
}

export interface InviteTokenValidation {
  valid: boolean;
  company_id?: number;
  company_name?: string;
  role?: string;
  masked_email?: string | null;
  course_id?: number | null;
  requires_phone_verification?: boolean;
  error?: string;
}

export interface SignupFromInvitePayload {
  invite_token: string;
  verification_session_token?: string | null;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface SignupFromInviteResponse {
  id: number;
  email: string;
  company_id: number;
  role: string;
}

export type OnboardingInviteCreateApiResponse = ApiResponse<OnboardingInviteCreateResponse>;
export type OnboardingInviteListApiResponse = ApiResponse<OnboardingInviteListItem[]>;
export type InviteTokenValidationApiResponse = ApiResponse<InviteTokenValidation>;
export type SignupFromInviteApiResponse = ApiResponse<SignupFromInviteResponse>;
