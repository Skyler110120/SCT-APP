/**
 * Tests for onboardingInviteService.
 * Covers email onboarding: create invite, list, validate token, signup.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { onboardingInviteService } from "../../services/onboardingInviteService";

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
  target_email: "student@example.com",
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
  course_id: null,
  requires_phone_verification: false,
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

describe("onboardingInviteService.createInvite", () => {
  it("returns created invite data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCreateResponse);

    const result = await onboardingInviteService.createInvite(1, {
      email: "student@example.com",
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
          email: "student@example.com",
          role: "student",
        }),
      })
    );
  });

  it("includes course_id when provided", async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockCreateResponse, course_id: 5 });

    const result = await onboardingInviteService.createInvite(1, {
      email: "student@example.com",
      role: "student",
      course_id: 5,
    });

    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/onboarding-invites",
      expect.objectContaining({
        body: JSON.stringify({
          email: "student@example.com",
          role: "student",
          course_id: 5,
        }),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await onboardingInviteService.createInvite(1, {
      email: "invalid",
      role: "student",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("onboardingInviteService.listInvites", () => {
  it("returns list of invites", async () => {
    mockApiFetch.mockResolvedValueOnce([mockInviteListItem]);

    const result = await onboardingInviteService.listInvites(1);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].target_email).toBe("student@example.com");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await onboardingInviteService.listInvites(1);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("onboardingInviteService.validateInviteToken", () => {
  it("returns validation data when token is valid", async () => {
    mockApiFetch.mockResolvedValueOnce(mockValidationResponse);

    const result = await onboardingInviteService.validateInviteToken("jwt.token.here");

    expect(result.success).toBe(true);
    expect(result.data?.valid).toBe(true);
    expect(result.data?.company_name).toBe("Test Range");
  });

  it("returns invalid when token is bad", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid token"));

    const result = await onboardingInviteService.validateInviteToken("bad-token");

    expect(result.success).toBe(false);
    expect(result.data?.valid).toBe(false);
  });
});

describe("onboardingInviteService.signupFromInvite", () => {
  it("returns user data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockSignupResponse);

    const signupPayload = {
      invite_token: "valid.token",
      email: "student@range.com",
      password: "securepass123",
      first_name: "Jane",
      last_name: "Doe",
    };

    const result = await onboardingInviteService.signupFromInvite(signupPayload);

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("student@range.com");
    expect(result.data?.company_id).toBe(1);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invite expired"));

    const result = await onboardingInviteService.signupFromInvite({
      invite_token: "expired.token",
      email: "x@test.com",
      password: "pass1234",
      first_name: "X",
      last_name: "Y",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
