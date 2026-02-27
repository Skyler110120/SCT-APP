import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  SessionDetailed,
  DirectBookingRequest,
  SessionUpdateRequest,
  AvailabilityCheckRequest,
  SessionResponse,
  SessionListResponse,
  AvailabilityCheckServiceResponse,
  SessionActionResponse,
  CalendarSessionsRequest,
} from "@/src/types/sessions.types";
import { SessionStatus } from "../types/enums";

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

      const params = new URLSearchParams({
        instructor_id: request.instructor_id.toString(),
        start_time: request.start_time,
        end_time: request.end_time,
      });

      const data = await apiFetch(`/sessions/check-availability?${params}`);

      console.log("Availability check result:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error checking instructor availability:", error);
      return {
        success: false,
        error: "Error occurred while checking availability",
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

      const data: SessionDetailed = await apiFetch<SessionDetailed>(`/sessions/direct-book`, {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

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

      const params = new URLSearchParams({
        as_student: asStudent.toString(),
        as_instructor: asInstructor.toString(),
      });

      if (statusFilter && statusFilter.length > 0) {
        statusFilter.forEach((status) => params.append("status", status));
      }

      const data: SessionDetailed[] = await apiFetch<SessionDetailed[]>(`/sessions?${params}`);

      console.log("Successfully fetched", data.length, "training sessions");

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return {
        success: false,
        error: "Error occurred while fetching sessions",
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

      const data: SessionDetailed = await apiFetch<SessionDetailed>(`/sessions/${sessionId}`);

      console.log("Successfully fetched session details:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching session by ID:", error);
      return {
        success: false,
        error: "Error occurred while fetching session details",
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

      const data: SessionDetailed = await apiFetch<SessionDetailed>(`/sessions/${sessionId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

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

      const data = await apiFetch(`/sessions/${sessionId}/cancel`, {
        method: "POST",
      });

      console.log("Session cancelled successfully:");

      return {
        success: true,
        data,
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

      const data: SessionDetailed = await apiFetch<SessionDetailed>(
        `/sessions/${sessionId}/complete`,
        {
          method: "POST",
        }
      );

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

      const params = new URLSearchParams({
        start_date: request.start_date,
        end_date: request.end_date,
      });

      const data: SessionDetailed[] = await apiFetch<SessionDetailed[]>(`/sessions/calendar?${params}`);

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
