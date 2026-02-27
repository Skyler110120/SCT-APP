import { ApiResponse } from "./auth.types";

export interface SmsInviteCreateRequest {
  phone_number: string;
  role: string;
  course_id?: number | null;
}

export interface SmsInviteCreateResponse {
  invite_id: number;
  status: string;
  web_join_url: string;
  mobile_join_url: string;
  expires_in_days: number;
}

export interface SmsInviteListItem {
  id: number;
  target_phone_number: string;
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
  phone_e164?: string;
  course_id?: number | null;
  requires_phone_verification?: boolean;
  error?: string;
}

export interface OtpRequestPayload {
  phone_number: string;
  purpose?: string;
  invite_token?: string;
}

export interface OtpResponse {
  success: boolean;
  cooldown_seconds: number;
  masked_phone?: string;
}

export interface OtpVerifyPayload {
  phone_number: string;
  otp_code: string;
  purpose?: string;
  invite_token?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  verification_session_token: string | null;
  error?: string;
}

export interface SignupFromInvitePayload {
  invite_token: string;
  verification_session_token: string;
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

export type SmsInviteCreateApiResponse = ApiResponse<SmsInviteCreateResponse>;
export type SmsInviteListApiResponse = ApiResponse<SmsInviteListItem[]>;
export type InviteTokenValidationApiResponse = ApiResponse<InviteTokenValidation>;
export type OtpApiResponse = ApiResponse<OtpResponse>;
export type OtpVerifyApiResponse = ApiResponse<OtpVerifyResponse>;
export type SignupFromInviteApiResponse = ApiResponse<SignupFromInviteResponse>;
