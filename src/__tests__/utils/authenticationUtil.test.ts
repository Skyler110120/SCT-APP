/**
 * Tests for requireAuthToken — the helper that throws AUTH_REQUIRED when no
 * token is in secure storage. Service callers depend on this throw to avoid
 * sending an unauthenticated request to a protected endpoint.
 */
jest.mock("@/src/services/authStorage", () => ({
  authStorage: {
    getAuthToken: jest.fn(),
  },
}));

import { authStorage } from "@/src/services/authStorage";
import { requireAuthToken } from "../../utils/authenticationUtil";

const mockGetAuthToken = authStorage.getAuthToken as jest.MockedFunction<
  typeof authStorage.getAuthToken
>;

beforeEach(() => {
  mockGetAuthToken.mockReset();
});

describe("requireAuthToken", () => {
  it("returns the token when present in storage", async () => {
    mockGetAuthToken.mockResolvedValueOnce("jwt-abc");
    await expect(requireAuthToken()).resolves.toBe("jwt-abc");
  });

  it("throws AUTH_REQUIRED when no token in storage", async () => {
    mockGetAuthToken.mockResolvedValueOnce(null);
    await expect(requireAuthToken()).rejects.toThrow("AUTH_REQUIRED");
  });

  it("throws AUTH_REQUIRED when token is empty string", async () => {
    mockGetAuthToken.mockResolvedValueOnce("");
    await expect(requireAuthToken()).rejects.toThrow("AUTH_REQUIRED");
  });
});
