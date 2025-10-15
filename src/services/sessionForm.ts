import { FlatListComponent, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SessionForm,
  CreateSessionFormRequest,
  UpdateSessionFormRequest,
  CompleteSessionFormRequest,
  SessionFormResponse,
  SessionFormListResponse,
  SessionFormCompleteResponse,
} from "../types/forms.types";

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

export const sessionFormService = {
  /**
   * Creates a new form for a session
   * @param formData - Data for the new session form
   * @returns A promise with the session form response
   */
  async createSessionForm(
    formData: CreateSessionFormRequest
  ): Promise<SessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/session-forms/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating session form: ", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create session form",
        };
      }

      const data: SessionForm = await response.json();
      return {
        success: true,
        data,
        message: "Session form created successfully",
      };
    } catch (error) {
      console.error("Failed to create session form: ", error);
      return {
        success: false,
        error: "Failed to create session form",
      };
    }
  },

  /**
   * Update a session form with student answers
   * @param formId - ID of the session form to update
   * @param formData - Data to update the session form
   * @returns A promise with the session form response
   */
  async updateSessionForm(
    formId: number,
    formData: UpdateSessionFormRequest
  ): Promise<SessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/session-forms/${formId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating the session form: ", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update the session form",
        };
      }

      const data: SessionForm = await response.json();
      return {
        success: true,
        data,
        message: "Session form updated successfully",
      };
    } catch (error) {
      console.error("Failed to update session form: ", error);
      return {
        success: false,
        error: "Failed to update the session form",
      };
    }
  },

  /**
   * Complete a session form once session is finished
   * @param formId - ID of the session form to complete
   * @param formData - Data to complete the sessio form with
   * @returns A promise with the session form complete response
   */
  async completeSessionForm(
    formId: number,
    formData: CompleteSessionFormRequest
  ): Promise<SessionFormCompleteResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/session-forms/${formId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error completing the session form: ", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to complete the session form",
        };
      }

      const data = await response.json();
      return {
        success: true,
        form_id: data.form_id,
        student_advanced: data.student_advanced,
        session_completed: data.session_completed,
        message: data.message || "Session form completed successfully",
      };
    } catch (error) {
      console.error("Failed to complete the session form: ", error);
      return {
        success: false,
        error: "Failed to complete the session form",
      };
    }
  },

  /**
   * Fetches a session form by its ID
   * @param formId - ID of the session form to fetch
   * @returns a promise with the session form response
   */
  async getSessionForm(formId: number): Promise<SessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/session-forms/${formId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching the session form: ", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch the sessio form",
        };
      }

      const data: SessionForm = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching session form: ", error);
      return {
        success: false,
        error: "Failed to fetch the session form",
      };
    }
  },

  /**
   * Gets all session forms for a specific user
   * @returns A promise with the session form list response
   */
  async getSessionForms(): Promise<SessionFormListResponse> {
    try {
        const token = await AsyncStorage.getItem("auth_token");

        if (!token) {
            return {
                success: false,
                error: "No authentication token found"
            }
        }

        const response = await fetch(`${API_URL}/session-forms/my-forms/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        })

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching session forms: ", errorData)
            return {
                success: false,
                error: errorData.detail || "Failed to fetch session forms"
            }
        }

        const data: SessionForm[] = await response.json();
        return {
            success: true,
            data
        }
    } catch (error) {
        console.error("Error fetching session forms: ", error);
        return {
            success: false,
            error: "Failed to fetch session forms"
        }
    }
  }
};
