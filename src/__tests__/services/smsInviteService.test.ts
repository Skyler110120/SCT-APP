/**
 * Tests for smsInviteService.
 * Covers SMS onboarding flow: create invite, list, validate token, OTP, signup.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { smsInviteService } from "../../services/smsInviteService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("mock-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockCreateResponse = {
  invite_id: 1,
  status: "sent",
  web_join_url: "https://app.example.com/join?token=abc",
  mobile_join_url: "sct://join?token=abc",
  expires_in_days: 7,
};

const mockInviteListItem = {
  id: 1,
  target_phone_number: "+15551234567",
  target_role: "student",
  invite_status: "pending",
  created_at: "2026-02-20T10:00:00Z",
  course_id: null,
};

const mockValidationResponse = {
  valid: true,
  company_id: 1,
  company_name: "Test Range",
  role: "student",
  phone_e164: "+15551234567",
  course_id: null,
  requires_phone_verification: true,
};

const mockOtpResponse = {
  success: true,
  cooldown_seconds: 60,
  masked_phone: "***-**-**567",
};

const mockOtpVerifyResponse = {
  verified: true,
  verification_session_token: "verif-session-token-123",
};

const mockSignupResponse = {
  id: 99,
  email: "student@range.com",
  company_id: 1,
  role: "student",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("smsInviteService.createInvite", () => {
  it("returns created invite data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCreateResponse);

    const result = await smsInviteService.createInvite(1, {
      phone_number: "+15551234567",
      role: "student",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCreateResponse);
    expect(result.data?.invite_id).toBe(1);
    expect(result.data?.web_join_url).toContain("token=abc");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/onboarding-invites",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          phone_number: "+15551234567",
          role: "student",
        }),
      })
    );
  });

  it("includes course_id when provided", async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockCreateResponse, course_id: 5 });

    const result = await smsInviteService.createInvite(1, {
      phone_number: "+15551234567",
      role: "student",
      course_id: 5,
    });

    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/onboarding-invites",
      expect.objectContaining({
        body: JSON.stringify({
          phone_number: "+15551234567",
          role: "student",
          course_id: 5,
        }),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid phone number"));

    const result = await smsInviteService.createInvite(1, {
      phone_number: "invalid",
      role: "student",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("smsInviteService.listInvites", () => {
  it("returns list of invites for company", async () => {
    mockApiFetch.mockResolvedValueOnce([mockInviteListItem]);

    const result = await smsInviteService.listInvites(1);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].target_phone_number).toBe("+15551234567");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/onboarding-invites"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));

    const result = await smsInviteService.listInvites(1);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("smsInviteService.validateInviteToken", () => {
  it("returns validation data when token is valid", async () => {
    mockApiFetch.mockResolvedValueOnce(mockValidationResponse);

    const result = await smsInviteService.validateInviteToken("jwt.token.here");

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockValidationResponse);
    expect(result.data?.valid).toBe(true);
    expect(result.data?.company_id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/onboarding/invites/validate?token=jwt.token.here"
    );
  });

  it("returns valid:false on invalid token", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid token"));

    const result = await smsInviteService.validateInviteToken("bad-token");

    expect(result.success).toBe(false);
    expect(result.data?.valid).toBe(false);
  });
});

describe("smsInviteService.requestOtp", () => {
  it("returns OTP response on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockOtpResponse);

    const result = await smsInviteService.requestOtp({
      phone_number: "+15551234567",
    });

    expect(result.success).toBe(true);
    expect(result.data?.success).toBe(true);
    expect(result.data?.cooldown_seconds).toBe(60);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/phone/request-otp",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone_number: "+15551234567" }),
      })
    );
  });

  it("includes invite_token when provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockOtpResponse);

    await smsInviteService.requestOtp({
      phone_number: "+15551234567",
      invite_token: "inv-token-123",
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/phone/request-otp",
      expect.objectContaining({
        body: JSON.stringify({
          phone_number: "+15551234567",
          invite_token: "inv-token-123",
        }),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Rate limited"));

    const result = await smsInviteService.requestOtp({
      phone_number: "+15551234567",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("smsInviteService.verifyOtp", () => {
  it("returns verification token on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockOtpVerifyResponse);

    const result = await smsInviteService.verifyOtp({
      phone_number: "+15551234567",
      otp_code: "123456",
    });

    expect(result.success).toBe(true);
    expect(result.data?.verified).toBe(true);
    expect(result.data?.verification_session_token).toBe(
      "verif-session-token-123"
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/phone/verify-otp",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          phone_number: "+15551234567",
          otp_code: "123456",
        }),
      })
    );
  });

  it("returns error on wrong OTP", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid OTP"));

    const result = await smsInviteService.verifyOtp({
      phone_number: "+15551234567",
      otp_code: "000000",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("smsInviteService.signupFromInvite", () => {
  const signupPayload = {
    invite_token: "inv-token",
    verification_session_token: "verif-token",
    email: "student@range.com",
    password: "ValidPass1",
    first_name: "Alice",
    last_name: "Smith",
  };

  it("returns user data on successful signup", async () => {
    mockApiFetch.mockResolvedValueOnce(mockSignupResponse);

    const result = await smsInviteService.signupFromInvite(signupPayload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockSignupResponse);
    expect(result.data?.email).toBe("student@range.com");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/signup-from-invite",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(signupPayload),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Token expired"));

    const result = await smsInviteService.signupFromInvite(signupPayload);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
