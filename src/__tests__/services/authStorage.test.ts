/**
 * Tests for authStorage — SecureStore-backed token persistence with legacy
 * AsyncStorage migration. Regressions here can either leak tokens to insecure
 * storage or silently drop the user's session on app startup.
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock("expo-secure-store", () => ({
  __esModule: true,
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { authStorage } from "../../services/authStorage";

const mockAsyncSet = AsyncStorage.setItem as jest.MockedFunction<
  typeof AsyncStorage.setItem
>;
const mockAsyncGet = AsyncStorage.getItem as jest.MockedFunction<
  typeof AsyncStorage.getItem
>;
const mockAsyncRemove = AsyncStorage.removeItem as jest.MockedFunction<
  typeof AsyncStorage.removeItem
>;
const mockAsyncMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<
  typeof AsyncStorage.multiRemove
>;
const mockSecureSet = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockSecureGet = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockSecureDelete = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockAsyncSet.mockResolvedValue(undefined as any);
  mockAsyncGet.mockResolvedValue(null);
  mockAsyncRemove.mockResolvedValue(undefined as any);
  mockAsyncMultiRemove.mockResolvedValue(undefined as any);
  mockSecureSet.mockResolvedValue(undefined as any);
  mockSecureGet.mockResolvedValue(null);
  mockSecureDelete.mockResolvedValue(undefined as any);
});

describe("authStorage.setAuthToken", () => {
  it("writes the token via SecureStore (preferred)", async () => {
    await authStorage.setAuthToken("jwt-token");
    expect(mockSecureSet).toHaveBeenCalledWith("auth_token", "jwt-token");
    expect(mockAsyncSet).not.toHaveBeenCalled();
  });

  it("falls back to AsyncStorage when SecureStore throws", async () => {
    mockSecureSet.mockRejectedValueOnce(new Error("Keychain unavailable"));

    await authStorage.setAuthToken("jwt-token");

    expect(mockAsyncSet).toHaveBeenCalledWith("auth_token", "jwt-token");
  });
});

describe("authStorage.getAuthToken", () => {
  it("returns the SecureStore value when available", async () => {
    mockSecureGet.mockResolvedValueOnce("secure-jwt");
    await expect(authStorage.getAuthToken()).resolves.toBe("secure-jwt");
    expect(mockAsyncGet).not.toHaveBeenCalled();
  });

  it("migrates a legacy AsyncStorage value into SecureStore and clears the legacy copy", async () => {
    mockSecureGet.mockResolvedValueOnce(null);
    mockAsyncGet.mockResolvedValueOnce("legacy-jwt");

    const value = await authStorage.getAuthToken();

    expect(value).toBe("legacy-jwt");
    expect(mockSecureSet).toHaveBeenCalledWith("auth_token", "legacy-jwt");
    expect(mockAsyncRemove).toHaveBeenCalledWith("auth_token");
  });

  it("returns null when no token in either secure or legacy storage", async () => {
    mockSecureGet.mockResolvedValueOnce(null);
    mockAsyncGet.mockResolvedValueOnce(null);

    await expect(authStorage.getAuthToken()).resolves.toBeNull();
    expect(mockSecureSet).not.toHaveBeenCalled();
  });

  it("returns null when SecureStore.get throws and legacy is also empty", async () => {
    mockSecureGet.mockRejectedValueOnce(new Error("Keychain failure"));
    mockAsyncGet.mockResolvedValueOnce(null);

    await expect(authStorage.getAuthToken()).resolves.toBeNull();
  });
});

describe("authStorage.clearAuthData", () => {
  it("removes auth_token, token_data, and user_data from both storage backends", async () => {
    await authStorage.clearAuthData();

    expect(mockSecureDelete).toHaveBeenCalledWith("auth_token");
    expect(mockSecureDelete).toHaveBeenCalledWith("token_data");
    expect(mockSecureDelete).toHaveBeenCalledWith("user_data");
    expect(mockAsyncMultiRemove).toHaveBeenCalledWith([
      "auth_token",
      "token_data",
      "user_data",
    ]);
  });

  it("still clears AsyncStorage even if SecureStore deletes throw", async () => {
    mockSecureDelete.mockRejectedValue(new Error("not available"));

    await authStorage.clearAuthData();

    expect(mockAsyncMultiRemove).toHaveBeenCalledWith([
      "auth_token",
      "token_data",
      "user_data",
    ]);
  });
});

describe("authStorage token/user data helpers", () => {
  it("sets and gets token data JSON", async () => {
    await authStorage.setTokenData('{"a":1}');
    expect(mockSecureSet).toHaveBeenCalledWith("token_data", '{"a":1}');

    mockSecureGet.mockResolvedValueOnce('{"a":1}');
    const value = await authStorage.getTokenDataJson();
    expect(value).toBe('{"a":1}');
  });

  it("sets and gets user data JSON", async () => {
    await authStorage.setUserData('{"id":1}');
    expect(mockSecureSet).toHaveBeenCalledWith("user_data", '{"id":1}');

    mockSecureGet.mockResolvedValueOnce('{"id":1}');
    const value = await authStorage.getUserDataJson();
    expect(value).toBe('{"id":1}');
  });
});
