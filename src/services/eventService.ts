import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  Event,
  UpdateEventRequest,
  EventResponse,
  EventListResponse,
  CreateEventRequest,
} from "../types/event.types";

export const eventService = {
  /**
   * Gets an event by ID
   * @param eventID - ID of the event to fetch
   * @return Promise with event data or error message
   */
  async getEvent(eventID: number): Promise<EventResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Event = await apiFetch<Event>(`/events/${eventID}`);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching event:", error);
      return {
        success: false,
        error: "An error occurred while fetching the event",
      };
    }
  },

  /**
   * Gets all events for a company
   * @param companyID - ID of the company to fetch events for
   * @return Promise with list of events or error message
   */
  async getEventsByCompany(companyID: number): Promise<EventListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Event[] = await apiFetch<Event[]>(`/events/company/${companyID}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log("Error fetching events:", error);
      return {
        success: false,
        error: "An error occurred while fetching events",
      };
    }
  },

  /**
   * Get all events for a comapny within a date range
   * @param companyId - ID of the company to fetch events for
   * @param startTime - Start date of the range in ISO format
   * @param endTime - End date of the range in ISO format
   * @return Promise with list of events or error message
   */
  async getEventsByCompanyAndTimeRange(
    companyId: number,
    startTime: string,
    endTime: string
  ): Promise<EventListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Event[] = await apiFetch<Event[]>(
        `/events/company/${companyId}/time?start_time=${encodeURIComponent(
          startTime
        )}&end_time=${encodeURIComponent(endTime)}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching events by date range:", error);
      return {
        success: false,
        error: "An error occurred while fetching events by date range",
      };
    }
  },

  /**
   * Creates a new event
   * @param eventData - Event data to create
   * @return Promise with created event data or error message
   */
  async createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data:Event = await apiFetch<Event>(`/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(eventData),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error creating event:", error);
      return {
        success: false,
        error: "An error occurred while creating the event",
      };
    }
  },

  /**
   * Updates an existing event
   * @param eventId - ID of the event to update
   * @param updateData - Data to update the event with
   * @return Promise with updated event data or error message
   */
  async updateEvent(
    eventId: number,
    updateData: UpdateEventRequest
  ): Promise<EventResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const data: Event = await apiFetch<Event>(`/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updateData),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating event:", error);
      return {
        success: false,
        error: "An error occurred while updating the event",
      };
    }
  },

  /**
   * Deletes an event by ID
   * @param eventId - ID of the event to delete
   * @return Promise with success status or error message
   */
  async deleteEvent(eventId: number): Promise<EventResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await apiFetch(`/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      return {
        success: true,
        message: "Event deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      return {
        success: false,
        error: "An error occurred while deleting the event",
      };
    }
  },
};
