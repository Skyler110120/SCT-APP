import {
  LoginCredentials,
  TokenResponse,
  LoginResponse,
  UserInfo,
  UserResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from "../types/auth.types";
import { apiFetch } from "./api";
import { authStorage } from "./authStorage";
import { logger } from "../utils/logger";

export const authService = {
  /**
   * Login a user with email and password
   * @param credentials - user login credentials
   * @returns Promise with token and user data or null if login fails
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      logger.debug("Attempting login");

      const formData = new FormData();
      formData.append("username", credentials.email.toLowerCase());
      formData.append("password", credentials.password);

      const tokenData = await apiFetch(`/auth/login`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "",
        }
      });

      await authStorage.setAuthToken(tokenData.access_token);
      await authStorage.setTokenData(JSON.stringify(tokenData));

      logger.debug("Login successful");

      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      logger.error("Login error:", error);
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
      const authToken = token || (await authStorage.getAuthToken());

      if (!authToken) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }
      logger.debug("Fetching current user profile");

      const userData = await apiFetch("/auth/me");

      await authStorage.setUserData(JSON.stringify(userData));

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      logger.error("Get current user error:", error);
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
      const token = await authStorage.getAuthToken();

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      logger.debug("Refreshing user information");

      const tokenData = await apiFetch<TokenResponse>(`/auth/refresh`);

      await authStorage.setAuthToken(tokenData.access_token);
      await authStorage.setTokenData(JSON.stringify(tokenData));

      logger.debug("User information refreshed successfully");
      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      logger.error("Refresh user info error:", error);
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
      const token = await authStorage.getAuthToken();

      if (!token) {
        logger.debug("No authentication token found");
        return null;
      }

      const user = await this.getCurrentUser(token);

      if (!user.success || !user.data) {
        logger.debug("Token validation failed");
        await this.clearAuthData();
        return null;
      }

      logger.debug("Auth check successful");
      return {
        token,
        user: user.data,
      };
    } catch (error) {
      logger.error("Check auth error:", error);
      return null;
    }
  },

  /**
   * Get stored token without validation
   * @returns stored token or null
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await authStorage.getAuthToken();
    } catch (error) {
      logger.error("Get stored token error:", error);
      return null;
    }
  },

  async getStoredTokenData(): Promise<TokenResponse | null> {
    try {
      const tokenDataString = await authStorage.getTokenDataJson();

      if (!tokenDataString) {
        return null;
      }

      return JSON.parse(tokenDataString) as TokenResponse;
    } catch (error) {
      logger.error("Get stored token data error:", error);
      return null;
    }
  },

  /**
   * Clear all authentication data from storage
   */
  async clearAuthData(): Promise<void> {
    try {
      await authStorage.clearAuthData();
      logger.debug("Authentication data cleared");
    } catch (error) {
      logger.error("Clear auth data error:", error);
    }
  },

  /**
   * Logout the current user by removing the token
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    try {
      logger.debug("Logging out user");
      await this.clearAuthData();
      logger.debug("User logged out successfully");
    } catch (error) {
      logger.error("Logout error:", error);
    }
  },

  /**
   * Check if the user is authenticated
   * @returns True if token exists in storag
   */
  async hasStoredToken(): Promise<boolean> {
    try {
      const token = await authStorage.getAuthToken();
      return !!token;
    } catch (error) {
      logger.error("Check auth error:", error);
      return false;
    }
  },

  /**
   * Request a password-reset email.
   */
  async requestPasswordReset(payload: ForgotPasswordRequest): Promise<MessageResponse> {
    try {
      const data = await apiFetch<{ message?: string }>(`/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          Authorization: "",
        },
      });
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      logger.error("Forgot password request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to request password reset",
      };
    }
  },

  /**
   * Validate a password-reset token.
   */
  async validatePasswordResetToken(
    token: string
  ): Promise<{ success: boolean; valid: boolean; error?: string }> {
    try {
      const data = await apiFetch<{ valid: boolean }>(
        `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            Authorization: "",
          },
        }
      );
      return {
        success: true,
        valid: Boolean(data.valid),
      };
    } catch (error) {
      logger.error("Reset token validation failed:", error);
      return {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : "Failed to validate reset token",
      };
    }
  },

  /**
   * Reset password with a reset token.
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      const data = await apiFetch<{ message?: string }>(`/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          Authorization: "",
        },
      });
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      logger.error("Reset password failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset password",
      };
    }
  },

};
