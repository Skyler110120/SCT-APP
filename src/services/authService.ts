import {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
} from "../types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from 'react-native';

// Choose the right API URL based on where you're running
let API_URL: string;

if (__DEV__) {
  if (Platform.OS === 'android') {
    API_URL = 'http://10.0.2.2:8000';
  } else {
    API_URL = 'http://localhost:8000';
  }
} else {
  API_URL = 'https://your-production-api.com';
}

export const authService = {
  /**
   * Login a user with email and password
   * @param credentials - user login credentials
   * @returns Promise with token and user data or null if login fails
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ token: string; user: User } | null> {
    try {
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
        console.error("Login failed:", errorData);
        return null;
      }

      const data = await response.json();
      const token = data.access_token;

      await AsyncStorage.setItem("auth_token", token);

      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!userResponse.ok) {
        console.error("Failed to fetch user profile");
        return null;
      }

      const user: User = await userResponse.json();
      return { token, user };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },
  /**
   * Register a new user
   * @param userData - user registration data
   * @returns Promise with success staus and data or error
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Response is not valid JSON:');
        return {
          success: false,
          error: responseText || "Registration failed"
        };
      }

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? data.detail || "Registration failed" : undefined,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "An error occurred during registration",
      };
    }
  },
  /**
   * Get the current user profile using stored token
   * @param token - authentication token
   * @returns Promise with user data or null if fetch fails
   */
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
  /**
   * Check if there's a stored token and validates it
   * @returns Promise with token and user data or null if no valid token
   */
  async checkAuth(): Promise<{ token: string; user: User } | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return null;
      }

      const user = await this.getCurrentUser(token);

      if (!user) {
        await AsyncStorage.removeItem("auth_token");
        return null;
      }

      return { token, user };
    } catch (error) {
      console.error("Check auth error:", error);
      return null;
    }
  },

  /**
   * Logout the current user by removing the token
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};
