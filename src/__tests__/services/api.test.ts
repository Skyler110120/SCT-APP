import { ApiError, apiFetch } from "../../services/api";

jest.mock("../../config", () => ({
  API_URL: "https://api.example.com",
  API_TIMEOUT: 20,
}));

jest.mock("../../services/authStorage", () => ({
  authStorage: {
    getAuthToken: jest.fn(),
    clearAuthData: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock("../../utils/globalErrorBus", () => ({
  emitGlobalError: jest.fn(),
}));

import { authStorage } from "../../services/authStorage";
import { router } from "expo-router";
import { emitGlobalError } from "../../utils/globalErrorBus";

const mockGetAuthToken = authStorage.getAuthToken as jest.MockedFunction<
  typeof authStorage.getAuthToken
>;
const mockClearAuthData = authStorage.clearAuthData as jest.MockedFunction<
  typeof authStorage.clearAuthData
>;
const mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;
const mockEmitGlobalError = emitGlobalError as jest.MockedFunction<typeof emitGlobalError>;

describe("apiFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthToken.mockResolvedValue("token-123");
    mockClearAuthData.mockResolvedValue();
  });

  it("adds trailing slash for root POST endpoints", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    await apiFetch("/payments", { method: "POST", body: JSON.stringify({ a: 1 }) });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/payments/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      })
    );
  });

  it("clears auth + redirects on 401 outside login endpoint", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "expired" }),
    } as Response);

    await expect(apiFetch("/profiles/me")).rejects.toThrow("Unauthorized");
    expect(mockClearAuthData).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith("/login");
  });

  it("does not redirect on login 401", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "bad creds" }),
    } as Response);

    await expect(
      apiFetch("/auth/login", { method: "POST", body: JSON.stringify({}) })
    ).rejects.toThrow("Unauthorized");
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("emits global error for network failure", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(apiFetch("/courses")).rejects.toBeInstanceOf(ApiError);
    expect(mockEmitGlobalError).toHaveBeenCalled();
  });
});
