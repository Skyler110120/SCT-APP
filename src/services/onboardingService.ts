import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0,2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
} else {
  API_URL = "https://your-production-api.com";
}

interface OnboardingResponse {
  message: string;
  company_id: number;
  role: string;
}

interface UserUpdateResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: number;
}

export const onboardingService = {
  /**
   * Completes the onboarding process by submitting an invite code
   * @param code - company invite code entered by the user
   * @returns Promise with onboarding data or null if submission fails
   */
  async completeOnboarding(code: string): Promise<OnboardingResponse | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        console.error("No authentication token found");
        return null;
      }

      const response = await fetch(`${API_URL}/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.detail || "Failed to complete onboarding";

        console.error("Onboarding failed:", errorMessage);

        throw new Error(errorMessage);
      }

      const data: OnboardingResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error("Onboarding error:", error);
      throw new Error("An unexpected error occured during onboarding");
    }
  },

  /**
   * Updates the user data after successful onboarding
   * @param userId - partial user data to update
   * @param comapnyId - the company ID to assign the user to
   * @returns Promise indicating success or failure
   */
  async updateUserAfterOnboarding(
    userId: number,
    companyId: number
  ): Promise<UserUpdateResponse | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        console.error("No auth token available");
        return null;
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ company_id: companyId}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("User update failed:", errorData);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Update user error:", error);
      return null;
    }
  },
};
