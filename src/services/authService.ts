import {
  LoginCredentials,
  TokenResponse,
  LoginResponse,
  UserInfo,
  UserResponse,
} from "../types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Choose the right API URL based on where you're running
let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
} else {
  API_URL = "https://your-production-api.com";
}

const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  TOKEN_DATA: "token_data",
  USER_DATA: "user_data",
} as const;

export const authService = {
  /**
   * Login a user with email and password
   * @param credentials - user login credentials
   * @returns Promise with token and user data or null if login fails
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log("Attempting login for:", credentials.email);

      const formData = new FormData();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.detail || "Login failed",
        };
      }

      const tokenData: TokenResponse = await response.json();

      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        tokenData.access_token
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_DATA,
        JSON.stringify(tokenData)
      );

      console.log("Login successful for:", credentials.email);

      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An error occurred during login",
      };
    }
  },
  /**
   * Get the current user profile using stored token
   * @param token - authentication token
   * @returns Promise with user data or null if fetch fails
   */
  async getCurrentUser(token?: string): Promise<UserResponse> {
    try {
      const authToken =
        token || (await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));

      if (!authToken) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }
      console.log("Fetching current user profile");

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch user profile, status:", errorData);

        if (response.status === 401) {
          await this.clearAuthData();
          return {
            success: false,
            error: "Authentication expired",
          };
        }

        return {
          success: false,
          error: "Failed to fetch user profile",
        };
      }

      console.log("User profile fetched");
      const userData: UserInfo = await response.json();
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return {
        success: false,
        error: "An error occurred while fetching user profile",
      };
    }
  },
  /**
   * Refresh user information and get updated token
   * @returns Promise with fresh token or error
   */
  async refreshUserInfo(): Promise<LoginResponse> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      console.log("Refreshing user information");

      const response = await fetch(`${API_URL}/auth/refresh`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to refresh user info:", errorData);

        if (response.status === 401) {
          await this.clearAuthData();
          return {
            success: false,
            error: "Authentication expired",
          };
        }

        return {
          success: false,
          error: errorData.detail || "Failed to refresh user info",
        };
      }

      const tokenData: TokenResponse = await response.json();
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        tokenData.access_token
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_DATA,
        JSON.stringify(tokenData)
      );

      console.log("User information refreshed successfully");
      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      console.error("Refresh user info error:", error);
      return {
        success: false,
        error: "An error occurred while refreshing user information",
      };
    }
  },
  /**
   * Check if there's a stored token and validates it
   * @returns Promise with token and user data or null if no valid token
   */
  async checkAuth(): Promise<{ token: string; user: UserInfo } | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        console.log("No authentication token found");
        return null;
      }

      const user = await this.getCurrentUser(token);

      if (!user.success || !user.data) {
        console.log("Token validation failed");
        await this.clearAuthData();
        return null;
      }

      console.log("Auth check successful");
      return {
        token,
        user: user.data,
      };
    } catch (error) {
      console.error("Check auth error:", error);
      await this.checkAuth;
      return null;
    }
  },

  /**
   * Get stored token without validation
   * @returns stored token or null
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Get stored token error:", error);
      return null;
    }
  },

  async getStoredTokenData(): Promise<TokenResponse | null> {
    try {
      const tokenDataString = await AsyncStorage.getItem(
        STORAGE_KEYS.TOKEN_DATA
      );

      if (!tokenDataString) {
        return null;
      }

      return JSON.parse(tokenDataString) as TokenResponse;
    } catch (error) {
      console.error("Get stored token data error:", error);
      return null;
    }
  },

  /**
   * Clear all authentication data from storage
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.TOKEN_DATA,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log("Authentication data cleared");
    } catch (error) {
      console.error("Clear auth data error:", error);
    }
  },

  /**
   * Logout the current user by removing the token
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    console.log("logging out user");
    await this.clearAuthData();
    try {
      console.log("logging out user");
      await this.clearAuthData();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  /**
   * Check if the user is authenticated
   * @returns True if token exists in storag
   */
  async hasStoredToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error("Check auth error:", error);
      return false;
    }
  },

};
