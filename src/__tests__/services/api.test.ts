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
    ).rejects.toThrow("Invalid credentials");
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("emits global error for network failure", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(apiFetch("/courses")).rejects.toBeInstanceOf(ApiError);
    expect(mockEmitGlobalError).toHaveBeenCalled();
  });

  it("throws 408 ApiError and emits timeout event when request stalls", async () => {
    // Take longer than the configured API_TIMEOUT (20ms).
    global.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve({ ok: true, status: 200, json: async () => ({}) } as Response), 100)
        )
    );

    await expect(apiFetch("/courses")).rejects.toMatchObject({ status: 408 });
    expect(mockEmitGlobalError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "timeout", status: 408 })
    );
  });

  it("emits a server-error event for 500 responses", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "boom" }),
    } as Response);

    await expect(apiFetch("/courses")).rejects.toBeInstanceOf(ApiError);

    const arg = mockEmitGlobalError.mock.calls[0][0];
    expect(arg.kind).toBe("server");
    expect(arg.status).toBe(500);
  });

  it("throws a generic Error for 403 (no ApiError, no global emit)", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "no" }),
    } as Response);

    await expect(apiFetch("/protected")).rejects.toThrow("Forbidden access");
  });

  it("throws an ApiError with status 409 for conflict responses", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: "duplicate" }),
    } as Response);

    await expect(apiFetch("/sessions")).rejects.toMatchObject({
      status: 409,
      message: "Request Conflict",
    });
  });

  it("suppresses the global error bus when suppressGlobalError=true", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "boom" }),
    } as Response);

    await expect(
      apiFetch("/courses", { suppressGlobalError: true })
    ).rejects.toBeInstanceOf(ApiError);
    expect(mockEmitGlobalError).not.toHaveBeenCalled();
  });

  it("returns parsed JSON on 200 success", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ value: 42 }),
    } as Response);

    const result = await apiFetch<{ value: number }>("/courses");
    expect(result).toEqual({ value: 42 });
    expect(mockEmitGlobalError).not.toHaveBeenCalled();
  });

  it("treats 204 (empty body) as a successful resolve with null data", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("no body");
      },
    } as unknown as Response);

    const result = await apiFetch("/sessions/1", { method: "DELETE" });
    expect(result).toBeNull();
  });

  it("does NOT clear or redirect when 401 is returned by the /issue-reports endpoint avoidance — issue path still triggers logout but not emit", async () => {
    // Issue-reports path is excluded from emit but NOT from the 401 redirect.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "expired" }),
    } as Response);

    await expect(apiFetch("/issue-reports")).rejects.toMatchObject({
      status: 401,
    });
    expect(mockEmitGlobalError).not.toHaveBeenCalled();
    expect(mockClearAuthData).toHaveBeenCalled();
  });

  it("does not attach Authorization header when no token in storage", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({}) });

    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("preserves query string when adding trailing slash to a root endpoint", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiFetch("/users?role=student");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/users/?role=student",
      expect.anything()
    );
  });

  it("does not add a trailing slash to nested resource paths", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiFetch("/users/123");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/users/123",
      expect.anything()
    );
  });

  it("uses provided friendlyErrorTitle on the emitted global error", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "boom" }),
    } as Response);

    await expect(
      apiFetch("/courses", { friendlyErrorTitle: "Could not load courses" })
    ).rejects.toBeInstanceOf(ApiError);

    expect(mockEmitGlobalError).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Could not load courses" })
    );
  });
});
