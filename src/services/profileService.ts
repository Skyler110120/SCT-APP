import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  ProfileDetailed,
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileResponse,
  ProfileListResponse,
  InstructorListRequest,
} from "@/src/types/profile.types";

export const profileService = {
  /**
   * Gets the current user's profile.
   * If no profile exists, backend creates one automatically
   * @returns Promise with current user's profile or error message
   */
  async getMyProfile(): Promise<ProfileResponse> {
    try {
      console.log("Fetching current user's profile");

      const data: ProfileDetailed = await apiFetch<ProfileDetailed>(`/profiles/me`);

      console.log("Profile fetched successfully");
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        success: false,
        error: "Error occurred while fetching profile",
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

      const response = await apiFetch(`/profiles/me`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

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
        error: "Error occurred while updating profile",
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

      const data: ProfileDetailed = await apiFetch<ProfileDetailed>(`/profiles/${userId}`);

      console.log("Successfully fetched user profile");

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        success: false,
        error: "Error occurred while fetching user profile",
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

        const params = new URLSearchParams();
        if (request?.skip !== undefined) {
            params.append("skip", request.skip.toString());
        }
        if (request?.limit !== undefined) {
            params.append("limit", request.limit.toString());
        }

        const queryString = params.toString();
        const url = queryString
            ? `/profiles/instructors?${queryString}`
            : `/profiles/instructors`;
        
        const data: ProfileDetailed[] = await apiFetch<ProfileDetailed[]>(url);

        console.log("Successfully fetched instructor profiles");
        return {
            success: true,
            data,
        }
    } catch (error) {
        console.error("Error fetching instructors:", error);
        return {
            success: false,
            error: "Error occurred while fetching instructors",
        }
    }
  }
};
