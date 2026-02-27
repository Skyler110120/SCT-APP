import { apiFetch } from "./api";
import type {
  SmsInviteCreateRequest,
  SmsInviteCreateResponse,
  SmsInviteListItem,
  SmsInviteCreateApiResponse,
  SmsInviteListApiResponse,
  InviteTokenValidation,
  InviteTokenValidationApiResponse,
  OtpRequestPayload,
  OtpResponse,
  OtpApiResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  OtpVerifyApiResponse,
  SignupFromInvitePayload,
  SignupFromInviteResponse,
  SignupFromInviteApiResponse,
} from "../types/smsOnboarding.types";

export const smsInviteService = {
  async createInvite(
    companyId: number,
    payload: SmsInviteCreateRequest
  ): Promise<SmsInviteCreateApiResponse> {
    try {
      const data = await apiFetch<SmsInviteCreateResponse>(
        `/companies/${companyId}/onboarding-invites`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("SMS invite create error:", error);
      return {
        success: false,
        error: error?.detail || error?.message || "Failed to send SMS invite",
      };
    }
  },

  async listInvites(companyId: number): Promise<SmsInviteListApiResponse> {
    try {
      const data = await apiFetch<SmsInviteListItem[]>(
        `/companies/${companyId}/onboarding-invites`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("SMS invite list error:", error);
      return { success: false, error: error?.message || "Failed to list invites" };
    }
  },

  async validateInviteToken(token: string): Promise<InviteTokenValidationApiResponse> {
    try {
      const data = await apiFetch<InviteTokenValidation>(
        `/onboarding/invites/validate?token=${encodeURIComponent(token)}`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Invite token validation error:", error);
      return { success: false, data: { valid: false, error: "Validation failed" } };
    }
  },

  async requestOtp(payload: OtpRequestPayload): Promise<OtpApiResponse> {
    try {
      const data = await apiFetch<OtpResponse>("/auth/phone/request-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("OTP request error:", error);
      return {
        success: false,
        error: error?.detail || error?.message || "Failed to request OTP",
      };
    }
  },

  async verifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyApiResponse> {
    try {
      const data = await apiFetch<OtpVerifyResponse>("/auth/phone/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("OTP verify error:", error);
      return {
        success: false,
        error: error?.detail || error?.message || "Failed to verify OTP",
      };
    }
  },

  async signupFromInvite(
    payload: SignupFromInvitePayload
  ): Promise<SignupFromInviteApiResponse> {
    try {
      const data = await apiFetch<SignupFromInviteResponse>(
        "/auth/signup-from-invite",
        { method: "POST", body: JSON.stringify(payload) }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Signup from invite error:", error);
      return {
        success: false,
        error: error?.detail || error?.message || "Failed to complete signup",
      };
    }
  },
};
