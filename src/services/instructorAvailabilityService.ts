import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  Availability,
  AvailabilityUpdate,
  AvailabilityResponse,
  AvailabilityListResponse,
  CreateAvailabilityRequest
} from "../types/availability.types";

export const instructorAvailabilityService = {
  /**
   * gets the current user's availability (for instructor)
   * @returns Promise with availability data or null
   */
  async getMyAvailability(): Promise<AvailabilityListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Availability[] = await apiFetch<Availability[]>(`/availability/me`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      return {
        success: false,
        error: "Failed to fetch availability",
      };
    }
  },

  /**
   * Get an instructor's availability to display in the calendar
   * @param instructorId - ID of the instructor
   * @param startDate - Start date for the availability range (ISO string)
   * @param endDate - End date for the availability range (ISO string)
   * @returns Promise with availability data or null
   */
  async getAvailabilityForCalendar(
    instructorId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const data: Availability[] = await apiFetch<Availability[]>(`/availability/instructor/${instructorId}/calendar?${queryParams}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch availability for calendar:", error);
      return {
        success: false,
        error: "Failed to fetch availability for calendar",
      };
    }
  },

  /**
   * Create availability for the current instructor
   * @param availability - Availability data to create
   * @returns Promise with success status or error message
   */
  async createAvailability(
    availability: CreateAvailabilityRequest
  ): Promise<AvailabilityResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Availability = await apiFetch<Availability>(`/availability`, {
        method: "POST",
        body: JSON.stringify(availability),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to create availability:", error);
      return {
        success: false,
        error: "Failed to create availability",
      };
    }
  },

  /**
   * Update an existing availability
   * @param availabilityId - ID of the availability to update
   * @param availabilityUpdate - Availability data to update
   * @returns Promise with updated availability data or error message
   */
  async updateAvailability(
    availabilityId: number,
    availabilityUpdate: AvailabilityUpdate
  ): Promise<AvailabilityResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Availability = await apiFetch<Availability>(
        `/availability/${availabilityId}`,
        {
          method: "PATCH",
          body: JSON.stringify(availabilityUpdate),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to update availability:", error);
      return {
        success: false,
        error: "Failed to update availability",
      };
    }
  },

  /**
   * Delete an existing availability
   * @param availabilityId - ID of the availability to delete
   * @returns Promise with success status or error message
   */
  async deleteAvailability(
    availabilityId: number
  ): Promise<AvailabilityResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await apiFetch(
        `availability/${availabilityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      
      return {
        success: true,
        message: "Availability deleted successfully",
      }
    } catch (error) {
      console.error("Failed to delete availability:", error);
      return {
        success: false,
        error: "Failed to delete availability",
      };
    }
  },
};
