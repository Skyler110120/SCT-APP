import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TestSessionForm,
  CreateTestSessionFormRequest,
  UpdateTestSessionFormRequest,
  CompleteTestSessionFormRequest,
  TestSessionFormResponse,
  TestSessionFormListResponse,
  TestSessionFormCompleteResponse,
} from "../types/test.session.form.types";

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

export const testSessionFormService = {
  /**
   * Create a new test session form
   * @param formData - Data for the new test session form
   * @returns A promise with the test session form response
   */
  async createTestSessionForm(
    formData: CreateTestSessionFormRequest
  ): Promise<TestSessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/test-session-forms/`, {
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
        console.error("Failed to create test session form:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create test session form",
        };
      }

      const data: TestSessionForm = await response.json();
      return {
        success: true,
        data,
        message: "Test session form created successfully",
      };
    } catch (error) {
      console.error("Error creating test session form:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Update a test session form with assesment data and drill results
   * @param formId - ID of the test session form to update
   * @param updateData - Data to update the test session form with
   * @returns A promise with the updated test session form response
   */
  async updateTestSessionForm(
    formId: number,
    updateData: UpdateTestSessionFormRequest
  ): Promise<TestSessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/test-session-forms/${formId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update test session form:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update test session form",
        };
      }

      const data: TestSessionForm = await response.json();
      return {
        success: true,
        data,
        message: "Test session form updated successfully",
      };
    } catch (error) {
      console.error("Error updating test session form:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Complete a test session form
   * @param formId - ID of the test session form
   * @param completeData - Data to complete the test session form with
   * @returns A promise with the test session form complete response
   */
  async completeTestSessionForm(
    formId: number,
    completeData: CompleteTestSessionFormRequest
  ): Promise<TestSessionFormCompleteResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/test-session-forms/${formId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(completeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to complete test session form:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to complete test session form",
        };
      }

      const data = await response.json();
      return {
        success: true,
        form_id: data.form_id,
        student_advanced: data.student_advanced,
        session_completed: data.session_completed,
        student_id: data.student_id,
        course_id: data.course_id,
        week_completed: data.week_completed,
        message: data.message || "Test session form completed successfully",
      };
    } catch (error) {
      console.error("Error completing test session form:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Fetch a test session form by its ID
   * @param formId - ID of the test session form
   * @returns A promise with the test session form response
   */
  async getTestSessionForm(formId: number): Promise<TestSessionFormResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/test-session-forms/${formId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch test session form:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch test session form",
        };
      }

      const data: TestSessionForm = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching test session form:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Gets all test session forms for the current user
   * @returns A promise with the list of test session forms
   */
  async getTestSessionForms(): Promise<TestSessionFormListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/test-session-forms/my-forms/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch test session forms:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch test session forms",
        };
      }

      const data: TestSessionForm[] = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching test session forms:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
};
