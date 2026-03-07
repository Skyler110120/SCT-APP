import { apiFetch } from "./api";
import type {
  OnboardingInviteCreateRequest,
  OnboardingInviteCreateResponse,
  OnboardingInviteListItem,
  OnboardingInviteCreateApiResponse,
  OnboardingInviteListApiResponse,
  InviteTokenValidation,
  InviteTokenValidationApiResponse,
  SignupFromInvitePayload,
  SignupFromInviteResponse,
  SignupFromInviteApiResponse,
} from "../types/onboardingInvite.types";

export const onboardingInviteService = {
  async createInvite(
    companyId: number,
    payload: OnboardingInviteCreateRequest
  ): Promise<OnboardingInviteCreateApiResponse> {
    try {
      const data = await apiFetch<OnboardingInviteCreateResponse>(
        `/companies/${companyId}/onboarding-invites`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Onboarding invite create error:", error);
      return {
        success: false,
        error: error?.detail || error?.message || "Failed to send invite",
      };
    }
  },

  async listInvites(companyId: number): Promise<OnboardingInviteListApiResponse> {
    try {
      const data = await apiFetch<OnboardingInviteListItem[]>(
        `/companies/${companyId}/onboarding-invites`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("List invites error:", error);
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
