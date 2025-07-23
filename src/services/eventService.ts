import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Event,
  UpdateEventRequest,
  EventResponse,
  EventListResponse,
  CreateEventRequest,
} from "../types/event.types";

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

      const response = await fetch(`${API_URL}/events/${eventID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch event:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch event",
        };
      }

      const data: Event = await response.json();
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

      const response = await fetch(`${API_URL}/events/company/${companyID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch events:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch events",
        };
      }

      const data: Event[] = await response.json();
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

      const response = await fetch(
        `${API_URL}/events/company/${companyId}/time?start_time=${encodeURIComponent(
          startTime
        )}&end_time=${encodeURIComponent(endTime)}`,
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
        console.error("Failed to fetch events by time range: ", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch events by time range",
        };
      }

      const data: Event[] = await response.json();
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

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create event:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create event",
        };
      }

      const data: Event = await response.json();
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

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update event:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update event",
        };
      }

      const data: Event = await response.json();
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

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete event:", errorData);
        return {
            success: false,
            error: errorData.detail || "Failed to delete event"
        }
      }

      const data: Event = await response.json();
      return {
        success: true,
        data,
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
