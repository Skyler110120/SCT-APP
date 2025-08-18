import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ProfileDetailed,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileResponse,
  ProfileListResponse,
  InstructorListRequest,
} from "@/src/types/profile.types";

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

export const profileService = {
  /**
   * Gets the current user's profile.
   * If no profile exists, backend creates one automatically
   * @returns Promise with current user's profile or error message
   */
  async getMyProfile(): Promise<ProfileResponse> {
    try {
      console.log("Fetching current user's profile");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch profile",
        };
      }

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch profile:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch profile",
        };
      }

      const data: ProfileDetailed = await response.json();
      console.log("Profile fetched successfully");
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        success: false,
        error: "Network error occurred while fetching profile",
      };
    }
  },

  /**
   * Updates the current user's profile.
   * @param profileData the data to update the profile with
   * @returns Promise with updated profile details or error message
   */
  async updateMyProfile(
    profileData: ProfileUpdateRequest
  ): Promise<ProfileResponse> {
    try {
      console.log("Updating Profile Data:", profileData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to update profile",
        };
      }

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update profile:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update profile",
        };
      }

      const data: ProfileDetailed = await response.json();
      console.log("Profile updated successfully");

      return {
        success: true,
        data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error: "Network error occurred while updating profile",
      };
    }
  },

  /**
   * Gets a specific user's profile by user ID
   * Used by instructors to view student profiles and by students to view instructor profile
   * @param userId the ID of the user whose profile to fetch
   * @returns Promise with user profile or error message
   */
  async getUserProfile(userId: number): Promise<ProfileResponse> {
    try {
      console.log("Fetching profile for user ID:", userId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch user profile",
        };
      }

      const response = await fetch(`${API_URL}/profiles/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch user profile:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch user profile",
        };
      }

      const data: ProfileDetailed = await response.json();
      console.log("Successfully fetched user profile");

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        error: "Network error occurred while fetching user profile",
      };
    }
  },

  /**
   * Gets a list of all instructor profiles
   * Used for displaying available instructors to students
   * @param request Optional pagination parameters
   * @returns Promise with list of instructor profiles or error message
   */
  async getInstructors(
    request?: InstructorListRequest
  ): Promise<ProfileListResponse> {
    try {
        console.log("Fetching instructors with params:", request)

        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
            console.error("No authentication token found");
            return {
                success: false,
                error: "Authentication required to fetch instructors",
            };
        }

        const params = new URLSearchParams();
        if (request?.skip !== undefined) {
            params.append("skip", request.skip.toString());
        }
        if (request?.limit !== undefined) {
            params.append("limit", request.limit.toString());
        }

        const queryString = params.toString();
        const url = queryString
            ? `${API_URL}/profiles/instructors?${queryString}`
            : `${API_URL}/profiles/instructors`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to fetch instructors:", errorData);
            return {
                success: false,
                error: errorData.detail || "Failed to fetch instructors"
            }
        }

        const data: ProfileDetailed[] = await response.json();
        console.log("Successfully fetched instructor profiles");
        return {
            success: true,
            data,
        }
    } catch (error) {
        console.error("Error fetching instructors:", error);
        return {
            success: false,
            error: "Network error occurred while fetching instructors",
        }
    }
  }
};
