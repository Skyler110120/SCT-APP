/**
 * Tests for authService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { authService } from "../../services/authService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const mockMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<typeof AsyncStorage.multiRemove>;

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
};

beforeEach(() => {
  mockApiFetch.mockReset();
  mockGetItem.mockReset();
  mockSetItem.mockReset();
  mockMultiRemove.mockReset();
  mockGetItem.mockResolvedValue("mock-token");
  mockSetItem.mockResolvedValue(undefined);
  mockMultiRemove.mockResolvedValue(undefined);
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
    expect(mockSetItem).toHaveBeenCalledWith("auth_token", "jwt-token-123");
    expect(mockSetItem).toHaveBeenCalledWith("token_data", JSON.stringify(mockTokenData));
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
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it("returns user data on success when reading token from AsyncStorage", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserData);

    const result = await authService.getCurrentUser();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUserData);
    expect(mockGetItem).toHaveBeenCalledWith("auth_token");
  });

  it("returns error when no token is found", async () => {
    mockGetItem.mockResolvedValueOnce(null);

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
    expect(mockSetItem).toHaveBeenCalledWith("auth_token", "jwt-token-123");
  });

  it("returns error when no token in storage", async () => {
    mockGetItem.mockResolvedValueOnce(null);

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
    mockGetItem.mockResolvedValueOnce(null);

    const result = await authService.checkAuth();

    expect(result).toBeNull();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("returns null and clears auth when token validation fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await authService.checkAuth();

    expect(result).toBeNull();
    expect(mockMultiRemove).toHaveBeenCalled();
  });
});

describe("authService.getStoredToken", () => {
  it("returns token from AsyncStorage", async () => {
    mockGetItem.mockResolvedValueOnce("stored-token");

    const result = await authService.getStoredToken();

    expect(result).toBe("stored-token");
    expect(mockGetItem).toHaveBeenCalledWith("auth_token");
  });

  it("returns null when no token", async () => {
    mockGetItem.mockResolvedValueOnce(null);

    const result = await authService.getStoredToken();

    expect(result).toBeNull();
  });
});

describe("authService.getStoredTokenData", () => {
  it("returns parsed token data from AsyncStorage", async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify(mockTokenData));

    const result = await authService.getStoredTokenData();

    expect(result).toEqual(mockTokenData);
    expect(mockGetItem).toHaveBeenCalledWith("token_data");
  });

  it("returns null when no token data", async () => {
    mockGetItem.mockResolvedValueOnce(null);

    const result = await authService.getStoredTokenData();

    expect(result).toBeNull();
  });
});

describe("authService.clearAuthData", () => {
  it("removes auth_token, token_data, user_data from AsyncStorage", async () => {
    await authService.clearAuthData();

    expect(mockMultiRemove).toHaveBeenCalledWith([
      "auth_token",
      "token_data",
      "user_data",
    ]);
  });
});

describe("authService.logout", () => {
  it("calls clearAuthData", async () => {
    await authService.logout();

    expect(mockMultiRemove).toHaveBeenCalledWith([
      "auth_token",
      "token_data",
      "user_data",
    ]);
  });
});

describe("authService.hasStoredToken", () => {
  it("returns true when token exists", async () => {
    mockGetItem.mockResolvedValueOnce("token");

    const result = await authService.hasStoredToken();

    expect(result).toBe(true);
  });

  it("returns false when no token", async () => {
    mockGetItem.mockResolvedValueOnce(null);

    const result = await authService.hasStoredToken();

    expect(result).toBe(false);
  });
});
