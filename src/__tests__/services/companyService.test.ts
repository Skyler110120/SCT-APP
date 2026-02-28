/**
 * Tests for companyService.
 * All API calls are mocked via jest.mock so no network is needed.
 */
import { companyService } from "../../services/companyService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("mock-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockCompany = {
  id: 1,
  name: "Test Range",
  slug: "test-range",
  website: "https://testrange.com",
  is_active: true,
  stripe_account_id: null,
  payment_enabled: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockInviteCode = {
  id: 1,
  code: "TEST123",
  company_id: 1,
  created_by_id: 5,
  max_uses: 1,
  uses: 0,
  role: "student",
  is_active: true,
  expires_at: "2026-03-01T00:00:00Z",
  created_at: "2026-02-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("companyService.getCompany", () => {
  it("returns company data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCompany);
    const result = await companyService.getCompany(1);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test Range");
    expect(mockApiFetch).toHaveBeenCalledWith("/companies/1");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await companyService.getCompany(999);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("companyService.getAllCompanies", () => {
  it("returns list of companies", async () => {
    mockApiFetch.mockResolvedValueOnce([mockCompany]);
    const result = await companyService.getAllCompanies();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await companyService.getAllCompanies();
    expect(result.success).toBe(false);
  });
});

describe("companyService.createCompany", () => {
  it("returns created company", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCompany);
    const result = await companyService.createCompany({
      name: "Test Range",
      slug: "test-range",
    });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/companies", {
      method: "POST",
      body: JSON.stringify({ name: "Test Range", slug: "test-range" }),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Duplicate slug"));
    const result = await companyService.createCompany({
      name: "Test",
      slug: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("companyService.getInviteCodes", () => {
  it("returns invite codes for a company", async () => {
    mockApiFetch.mockResolvedValueOnce([mockInviteCode]);
    const result = await companyService.getInviteCodes(1);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].code).toBe("TEST123");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));
    const result = await companyService.getInviteCodes(1);
    expect(result.success).toBe(false);
  });
});

describe("companyService.createInviteCode", () => {
  it("returns created invite code and calls correct API path with role", async () => {
    mockApiFetch.mockResolvedValueOnce(mockInviteCode);
    const result = await companyService.createInviteCode({
      company_id: 1,
      role: "admin" as any,
    });
    expect(result.success).toBe(true);
    expect(result.data?.code).toBe("TEST123");
    // API path must include company_id and role per backend: POST /companies/{id}/invite-codes/{role}
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/invite-codes/admin",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns error when no auth token", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await companyService.createInviteCode({
      company_id: 1,
      role: "student" as any,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("No authentication token found");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Server error"));
    const result = await companyService.createInviteCode({
      company_id: 1,
      role: "student" as any,
    });
    expect(result.success).toBe(false);
  });
});

describe("companyService.getOnboardingLink", () => {
  const mockOnboardingResponse = {
    token: "jwt.token.here",
    join_url: "http://localhost:3000/join?token=jwt.token.here",
    company_id: 1,
    company_name: "Test Range",
    course_id: null,
    expires_in_days: 30,
  };

  it("returns onboarding link data", async () => {
    mockApiFetch.mockResolvedValueOnce(mockOnboardingResponse);
    const result = await companyService.getOnboardingLink(1);
    expect(result.success).toBe(true);
    expect(result.data?.token).toBe("jwt.token.here");
    expect(result.data?.expires_in_days).toBe(30);
  });

  it("includes course_id when provided", async () => {
    const withCourse = { ...mockOnboardingResponse, course_id: 5 };
    mockApiFetch.mockResolvedValueOnce(withCourse);
    const result = await companyService.getOnboardingLink(1, 5);
    expect(result.success).toBe(true);
    expect(result.data?.course_id).toBe(5);
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("course_id=5")
    );
  });

  it("does not include course_id param when not provided", async () => {
    mockApiFetch.mockResolvedValueOnce(mockOnboardingResponse);
    await companyService.getOnboardingLink(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/onboarding-link"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));
    const result = await companyService.getOnboardingLink(1);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
