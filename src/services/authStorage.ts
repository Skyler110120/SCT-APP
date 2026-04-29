import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  TOKEN_DATA: "token_data",
  USER_DATA: "user_data",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

async function safeSecureSetItem(key: StorageKey, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function safeSecureGetItem(key: StorageKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSecureDeleteItem(key: StorageKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore and still clear legacy storage
  }
}

async function getAndMigrateLegacyKey(key: StorageKey): Promise<string | null> {
  const secureValue = await safeSecureGetItem(key);
  if (secureValue !== null) return secureValue;

  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue === null) return null;

  await safeSecureSetItem(key, legacyValue);
  await AsyncStorage.removeItem(key);
  return legacyValue;
}

export const authStorage = {
  keys: STORAGE_KEYS,

  async setAuthToken(token: string): Promise<void> {
    await safeSecureSetItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return getAndMigrateLegacyKey(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setTokenData(tokenDataJson: string): Promise<void> {
    await safeSecureSetItem(STORAGE_KEYS.TOKEN_DATA, tokenDataJson);
  },

  async getTokenDataJson(): Promise<string | null> {
    return getAndMigrateLegacyKey(STORAGE_KEYS.TOKEN_DATA);
  },

  async setUserData(userDataJson: string): Promise<void> {
    await safeSecureSetItem(STORAGE_KEYS.USER_DATA, userDataJson);
  },

  async getUserDataJson(): Promise<string | null> {
    return getAndMigrateLegacyKey(STORAGE_KEYS.USER_DATA);
  },

  async clearAuthData(): Promise<void> {
    await Promise.all([
      safeSecureDeleteItem(STORAGE_KEYS.AUTH_TOKEN),
      safeSecureDeleteItem(STORAGE_KEYS.TOKEN_DATA),
      safeSecureDeleteItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.TOKEN_DATA,
        STORAGE_KEYS.USER_DATA,
      ]),
    ]);
  },
};
