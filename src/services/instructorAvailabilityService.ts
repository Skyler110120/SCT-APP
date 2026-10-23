import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, apiFetch } from "./api";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import {
  AdminCreateAvailabilityRequest,
  Availability,
  AvailabilityUpdate,
  AvailabilityResponse,
  AvailabilityListResponse,
  CreateAvailabilityRequest,
  TimeOffConflictDetail,
  TimeOffRequest,
  TimeOffResponse,
  TimeOffResult,
} from "../types/availability.types";

export const instructorAvailabilityService = {
  /**
   * gets the current user's availability (for instructor)
   * @returns Promise with availability data or null
   */
  async getMyAvailability(): Promise<AvailabilityListResponse> {
    try {
      const data: Availability[] = await apiFetch<Availability[]>(`/availability/me`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      return {
        success: false,
        error: getApiErrorMessage(error, "Failed to fetch availability"),
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
        error: getApiErrorMessage(error, "Failed to fetch availability for calendar"),
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
      const data: Availability = await apiFetch<Availability>(`/availability`, {
        method: "POST",
        suppressGlobalError: true,
        body: JSON.stringify(availability),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to create availability:", error);
      return {
        success: false,
        error: getApiErrorMessage(error, "Failed to create availability"),
      };
    }
  },

  /**
   * Company admin: create availability for a specific instructor.
   */
  async createAvailabilityAsAdmin(
    availability: AdminCreateAvailabilityRequest
  ): Promise<AvailabilityResponse> {
    try {
      const data: Availability = await apiFetch<Availability>(`/availability/admin`, {
        method: "POST",
        suppressGlobalError: true,
        body: JSON.stringify(availability),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to create availability as admin:", error);
      return {
        success: false,
        error: getApiErrorMessage(error, "Failed to create availability as admin"),
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
      const data: Availability = await apiFetch<Availability>(
        `/availability/${availabilityId}`,
        {
          method: "PATCH",
          suppressGlobalError: true,
          body: JSON.stringify(availabilityUpdate),
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
        error: getApiErrorMessage(error, "Failed to update availability"),
      };
    }
  },

  /**
   * Get availability for all instructors in the current user's company.
   * Used by students to see bookable slots across any instructor (TASK-ONB-004).
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getCompanyAvailability(
    startDate: string,
    endDate: string,
  ): Promise<AvailabilityListResponse> {
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      const data: Availability[] = await apiFetch<Availability[]>(
        `/availability/company/all?${params}`,
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch company availability:", error);
      return { success: false, error: "Failed to fetch company availability" };
    }
  },

  /**
   * Company admin: list all availability windows for one instructor.
   */
  async getInstructorAvailabilityForAdmin(
    instructorId: number
  ): Promise<AvailabilityListResponse> {
    try {
      const data: Availability[] = await apiFetch<Availability[]>(
        `/availability/admin/instructor/${instructorId}`
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch instructor availability for admin:", error);
      return {
        success: false,
        error: getApiErrorMessage(error, "Failed to fetch instructor availability for admin"),
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
      const response = await apiFetch(
        `/availability/${availabilityId}`,
        {
          method: "DELETE",
          suppressGlobalError: true,
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
        error: getApiErrorMessage(error, "Failed to delete availability"),
      };
    }
  },

  /**
   * Block availability (PTO / sick day). Instructors block their own time; admins and
   * delegated instructors pass instructor_id.
   */
  async applyTimeOff(body: TimeOffRequest): Promise<TimeOffResult> {
    const payload: Record<string, unknown> = {
      scope: body.scope,
      start_date: body.start_date,
      cancel_affected_sessions: body.cancel_affected_sessions,
    };
    if (body.end_date) payload.end_date = body.end_date;
    if (body.start_time) payload.start_time = body.start_time;
    if (body.end_time) payload.end_time = body.end_time;
    if (body.instructor_id != null && body.instructor_id > 0) {
      payload.instructor_id = body.instructor_id;
    }

    try {
      const data = await apiFetch<TimeOffResponse>(`/availability/time-off`, {
        method: "POST",
        suppressGlobalError: true,
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const detail = (error.body as { detail?: unknown } | undefined)?.detail;
        if (detail && typeof detail === "object" && "code" in detail) {
          return { success: false, conflict: detail as TimeOffConflictDetail };
        }
      }
      console.error("Failed to apply time off:", error);
      return {
        success: false,
        error: getApiErrorMessage(error, "Could not apply time off"),
      };
    }
  },
};
