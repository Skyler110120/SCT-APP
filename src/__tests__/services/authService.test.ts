/**
 * Tests for authService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { authService } from "../../services/authService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../../services/authStorage", () => ({
  authStorage: {
    setAuthToken: jest.fn(),
    getAuthToken: jest.fn(),
    setTokenData: jest.fn(),
    getTokenDataJson: jest.fn(),
    setUserData: jest.fn(),
    clearAuthData: jest.fn(),
  },
}));

import { apiFetch } from "../../services/api";
import { authStorage } from "../../services/authStorage";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockSetAuthToken = authStorage.setAuthToken as jest.MockedFunction<
  typeof authStorage.setAuthToken
>;
const mockGetAuthToken = authStorage.getAuthToken as jest.MockedFunction<
  typeof authStorage.getAuthToken
>;
const mockSetTokenData = authStorage.setTokenData as jest.MockedFunction<
  typeof authStorage.setTokenData
>;
const mockGetTokenDataJson = authStorage.getTokenDataJson as jest.MockedFunction<
  typeof authStorage.getTokenDataJson
>;
const mockClearAuthData = authStorage.clearAuthData as jest.MockedFunction<
  typeof authStorage.clearAuthData
>;
const mockSetUserData = authStorage.setUserData as jest.MockedFunction<
  typeof authStorage.setUserData
>;

const mockTokenData = {
  access_token: "jwt-token-123",
  token_type: "bearer",
  id: 1,
  email: "user@example.com",
  first_name: "Test",
  last_name: "User",
  role: "student",
  company_id: 1,
  needs_onboarding: false,
  has_completed_onboarding: true,
  is_approved: true,
};

const mockUserData = {
  id: 1,
  email: "user@example.com",
  first_name: "Test",
  last_name: "User",
  role: "student",
  company_id: 1,
  has_completed_onboarding: true,
  is_active: true,
  is_approved: true,
};

beforeEach(() => {
  mockApiFetch.mockReset();
  mockSetAuthToken.mockReset();
  mockGetAuthToken.mockReset();
  mockSetTokenData.mockReset();
  mockGetTokenDataJson.mockReset();
  mockClearAuthData.mockReset();
  mockSetUserData.mockReset();
  mockGetAuthToken.mockResolvedValue("mock-token");
  mockSetAuthToken.mockResolvedValue(undefined);
  mockSetTokenData.mockResolvedValue(undefined);
  mockGetTokenDataJson.mockResolvedValue(JSON.stringify(mockTokenData));
  mockSetUserData.mockResolvedValue(undefined);
  mockClearAuthData.mockResolvedValue(undefined);
});

describe("authService.login", () => {
  it("returns success and stores token on successful login", async () => {
    mockApiFetch.mockResolvedValueOnce(mockTokenData);

    const result = await authService.login({
      email: "user@Example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTokenData);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({ method: "POST" })
    );
    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-token-123");
    expect(mockSetTokenData).toHaveBeenCalledWith(JSON.stringify(mockTokenData));
  });

  it("returns error on login failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid credentials"));

    const result = await authService.login({
      email: "user@example.com",
      password: "wrong",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred during login");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("authService.getCurrentUser", () => {
  it("returns user data on success when token is passed", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserData);

    const result = await authService.getCurrentUser("my-token");

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUserData);
    expect(mockApiFetch).toHaveBeenCalledWith("/auth/me");
    expect(mockGetAuthToken).not.toHaveBeenCalled();
  });

  it("returns user data on success when reading token from AsyncStorage", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserData);

    const result = await authService.getCurrentUser();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUserData);
    expect(mockGetAuthToken).toHaveBeenCalled();
  });

  it("returns error when no token is found", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);

    const result = await authService.getCurrentUser();

    expect(result.success).toBe(false);
    expect(result.error).toBe("No authentication token found");
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await authService.getCurrentUser("token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while fetching user profile");
  });
});

describe("authService.refreshUserInfo", () => {
  it("returns token data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockTokenData);

    const result = await authService.refreshUserInfo();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTokenData);
    expect(mockApiFetch).toHaveBeenCalledWith("/auth/refresh");
    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-token-123");
  });

  it("returns error when no token in storage", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);

    const result = await authService.refreshUserInfo();

    expect(result.success).toBe(false);
    expect(result.error).toBe("No authentication token found");
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await authService.refreshUserInfo();

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while refreshing user information");
  });
});

describe("authService.checkAuth", () => {
  it("returns token and user when valid token exists", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserData);

    const result = await authService.checkAuth();

    expect(result).toEqual({ token: "mock-token", user: mockUserData });
    expect(mockApiFetch).toHaveBeenCalledWith("/auth/me");
  });

  it("returns null when no token in storage", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);

    const result = await authService.checkAuth();

    expect(result).toBeNull();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("returns null and clears auth when token validation fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await authService.checkAuth();

    expect(result).toBeNull();
    expect(mockClearAuthData).toHaveBeenCalled();
  });
});

describe("authService.getStoredToken", () => {
  it("returns token from AsyncStorage", async () => {
    mockGetAuthToken.mockResolvedValueOnce("stored-token");

    const result = await authService.getStoredToken();

    expect(result).toBe("stored-token");
    expect(mockGetAuthToken).toHaveBeenCalled();
  });

  it("returns null when no token", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);

    const result = await authService.getStoredToken();

    expect(result).toBeNull();
  });
});

describe("authService.getStoredTokenData", () => {
  it("returns parsed token data from AsyncStorage", async () => {
    mockGetTokenDataJson.mockResolvedValueOnce(JSON.stringify(mockTokenData));

    const result = await authService.getStoredTokenData();

    expect(result).toEqual(mockTokenData);
    expect(mockGetTokenDataJson).toHaveBeenCalled();
  });

  it("returns null when no token data", async () => {
    mockGetTokenDataJson.mockResolvedValueOnce(null);

    const result = await authService.getStoredTokenData();

    expect(result).toBeNull();
  });
});

describe("authService.clearAuthData", () => {
  it("removes auth_token, token_data, user_data from AsyncStorage", async () => {
    await authService.clearAuthData();

    expect(mockClearAuthData).toHaveBeenCalled();
  });
});

describe("authService.logout", () => {
  it("calls clearAuthData", async () => {
    await authService.logout();

    expect(mockClearAuthData).toHaveBeenCalled();
  });
});

describe("authService.hasStoredToken", () => {
  it("returns true when token exists", async () => {
    mockGetAuthToken.mockResolvedValueOnce("token");

    const result = await authService.hasStoredToken();

    expect(result).toBe(true);
  });

  it("returns false when no token", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);

    const result = await authService.hasStoredToken();

    expect(result).toBe(false);
  });
});

describe("authService.requestPasswordReset", () => {
  it("calls forgot-password endpoint and returns success message", async () => {
    mockApiFetch.mockResolvedValueOnce({
      message: "If an account exists for that email, a password reset link has been sent.",
    });

    const result = await authService.requestPasswordReset({ email: "user@example.com" });

    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/forgot-password",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("authService.validatePasswordResetToken", () => {
  it("calls validate endpoint and returns valid=true", async () => {
    mockApiFetch.mockResolvedValueOnce({ valid: true });

    const result = await authService.validatePasswordResetToken("token-123");

    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/reset-password/validate?token=token-123",
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("authService.resetPassword", () => {
  it("calls reset-password endpoint and returns success", async () => {
    mockApiFetch.mockResolvedValueOnce({ message: "Password reset successfully" });

    const result = await authService.resetPassword({
      token: "token-123",
      new_password: "newpass123",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Password reset successfully");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/reset-password",
      expect.objectContaining({ method: "POST" })
    );
  });
});
