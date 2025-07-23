import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Availability,
  AvailabilityUpdate,
  AvailabilityResponse,
  AvailabilityListResponse,
  CreateAvailabilityRequest
} from "../types/availability.types";

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

      const response = await fetch(`${API_URL}/availability/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch availability:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch availabiltiy",
        };
      }

      const data: Availability[] = await response.json();
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
   * @returns Promise with availability data or null
   */
  async getAvailabilityForCalendar(
    instructorId: number
  ): Promise<AvailabilityListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/availability/instructor/${instructorId}/calendar`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch availability for calendar:", errorData);
        return {
          success: false,
          error:
            errorData.detail || "Failed to fetch availability for calendar",
        };
      }

      const data: Availability[] = await response.json();
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

      const response = await fetch(`${API_URL}/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(availability),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create availability:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create availability",
        };
      }

      const data: Availability = await response.json();
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

      const response = await fetch(
        `${API_URL}/availability/${availabilityId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(availabilityUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update availability:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update availability",
        };
      }

      const data: Availability = await response.json();
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

      const response = await fetch(
        `${API_URL}/availability/${availabilityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete availability:", errorData);
        return {
            success: false,
            error: errorData.detail || "Failed to delete availability"
        }
      }

      const data: Availability = await response.json();
      return {
        success: true,
        data,
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
