import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SessionDetailed,
  DirectBookingRequest,
  SessionUpdateRequest,
  AvailabilityCheckRequest,
  SessionResponse,
  SessionListResponse,
  AvailabilityCheckServiceResponse,
  SessionActionResponse,
  SessionStatus,
  CalendarSessionsRequest,
} from "@/src/types/sessions.types";

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

export const sessionService = {
  /**
   * Checks if availability is available for booking
   * @param request the request to check the availability
   * @returns a promise that resolves to the availability check response
   */
  async checkInstructorAvailability(
    request: AvailabilityCheckRequest
  ): Promise<AvailabilityCheckServiceResponse> {
    try {
      console.log("Request:", request);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found ");
        return {
          success: false,
          error: "Authentication required to check availability",
        };
      }

      const params = new URLSearchParams({
        instructor_id: request.instructor_id.toString(),
        start_time: request.start_time,
        end_time: request.end_time,
      });

      const response = await fetch(
        `${API_URL}/sessions/check-availability?${params}`,
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
        console.error("Failed to check availability:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to check instructor availability",
        };
      }

      const data = await response.json();
      console.log("Availability check result:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error checking instructor availability:", error);
      return {
        success: false,
        error: "Network error occurred while checking availability",
      };
    }
  },

  /**
   * Creates a new training session
   * @param bookingData the data required to book a session directly
   * @returns Promise with booking data or error message
   */
  async bookDirectSession(
    bookingData: DirectBookingRequest
  ): Promise<SessionActionResponse> {
    try {
      console.log("Booking Data:", bookingData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to book session",
        };
      }

      const response = await fetch(`${API_URL}/sessions/direct-book`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to book session:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to book session",
        };
      }

      const data: SessionDetailed = await response.json();
      console.log("Session booked successfully:", data);

      return {
        success: true,
        data,
        message: "Training session booked successfully",
      };
    } catch (error) {
      console.error("Error booking session:", error);
      return {
        success: false,
        error: "Network error occurred while booking session",
      };
    }
  },

  /**
   * Fetches the user's training sessions
   * @param asStudent if the user is a student
   * @param asInstructor if the user is an instructor
   * @param statusFilter the status of the session
   * @returns Promise with session list or error message
   */
  async getMySessions(
    asStudent: boolean = true,
    asInstructor: boolean = true,
    statusFilter?: SessionStatus[]
  ): Promise<SessionListResponse> {
    try {
      console.log(
        "Filters-Student:",
        asStudent,
        "Instructor:",
        asInstructor,
        "Status Filter:",
        statusFilter
      );

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch sessions",
        };
      }

      const params = new URLSearchParams({
        as_student: asStudent.toString(),
        as_instructor: asInstructor.toString(),
      });

      if (statusFilter && statusFilter.length > 0) {
        statusFilter.forEach((status) => params.append("status", status));
      }

      const response = await fetch(`${API_URL}/sessions?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch sessions:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch sessions",
        };
      }

      const data: SessionDetailed[] = await response.json();
      console.log("Successfully fetched", data.length, "training sessions");

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return {
        success: false,
        error: "Network error occurred while fetching sessions",
      };
    }
  },

  /**
   * Fetches a session by its ID
   * @param sessionId the ID of the session to fetch
   * @returns Promise with session details or error message
   */
  async getSessionById(sessionId: number): Promise<SessionResponse> {
    try {
      console.log("Session ID:", sessionId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch session details",
        };
      }

      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch session:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch session details",
        };
      }

      const data: SessionDetailed = await response.json();
      console.log("Successfully fetched session details:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching session by ID:", error);
      return {
        success: false,
        error: "Network error occurred while fetching session details",
      };
    }
  },

  /**
   * Update session details,
   * @param sessionId the ID of the session to update,
   * @param updateData the data to update the session with
   * @returns Promise with updated session details or error message
   */
  async updateSession(
    sessionId: number,
    updateData: SessionUpdateRequest
  ): Promise<SessionActionResponse> {
    try {
      console.log("Session ID:", sessionId);
      console.log("Update Data:", updateData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to update session",
        };
      }

      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update session:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update session",
        };
      }

      const data: SessionDetailed = await response.json();
      console.log("Session updated successfully:", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating session:", error);
      return {
        success: false,
        error: "Network error occurred while updating session",
      };
    }
  },

  /**
   * Cancel a training session
   * @param sessionId the ID of the session to cancel
   * @returns Promise with Cancelled session details or error message
   */
  async cancelSession(sessionId: number): Promise<SessionActionResponse> {
    try {
      console.log("Session ID:", sessionId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to cancel session",
        };
      }

      const response = await fetch(`${API_URL}/sessions/${sessionId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to cancel session:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to cancel session",
        };
      }

      const data = await response.json();
      console.log("Session cancelled successfully:");

      return {
        success: true,
        data: data.session,
        message: "Training session cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling session:", error);
      return {
        success: false,
        error: "Network error occurred while cancelling session",
      };
    }
  },

  /**
   * Mark session as completed
   * @param sessionId the ID of the session to mark as completed
   * @returns Promise with updated session details or error message
   */
  async completeSession(sessionId: number): Promise<SessionActionResponse> {
    try {
      console.log("Session ID:", sessionId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to mark session as completed",
        };
      }
      const response = await fetch(
        `${API_URL}/sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to complete session:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to mark session as completed",
        };
      }

      const data: SessionDetailed = await response.json();
      console.log("Session marked as completed:", data);
      return {
        success: true,
        data,
        message: "Training session marked as completed",
      };
    } catch (error) {
      console.error("Error marking session as completed:", error);
      return {
        success: false,
        error: "Network error occurred while marking session as completed",
      };
    }
  },

  /**
   * Get my calendar sessions for specific date range
   * @param request Date range for calendar
   * @returns Promise with calendar sessions or error
   */
  async getMyCalendarSessions(
    request: CalendarSessionsRequest
  ): Promise<SessionListResponse> {
    try {
      console.log("Date Range:", request);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch calendar sessions",
        };
      }

      const params = new URLSearchParams({
        start_date: request.start_date,
        end_date: request.end_date,
      });

      const response = await fetch(`${API_URL}/sessions/calendar?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch calendar sessions:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch calendar sessions",
        };
      }

      const data: SessionDetailed[] = await response.json();
      console.log("Successfully fetched", data.length, "calendar sessions");
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching calendar sessions:", error);
      return {
        success: false,
        error: "Network error occurred while fetching calendar sessions",
      };
    }
  },
};
