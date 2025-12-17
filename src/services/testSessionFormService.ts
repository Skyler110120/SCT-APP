import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  TestSessionForm,
  CreateTestSessionFormRequest,
  UpdateTestSessionFormRequest,
  CompleteTestSessionFormRequest,
  TestSessionFormResponse,
  TestSessionFormListResponse,
  TestSessionFormCompleteResponse,
} from "../types/test.session.form.types";

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
      const data: TestSessionForm = await apiFetch<TestSessionForm>(`/test-session-forms/`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      return {
        success: true,
        data,
        message: "Test session form created successfully",
      };
    } catch (error) {
      console.error("Error creating test session form:", error);
      return {
        success: false,
        error: "An error occurred",
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
      const data: TestSessionForm = await apiFetch<TestSessionForm>(`/test-session-forms/${formId}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      return {
        success: true,
        data,
        message: "Test session form updated successfully",
      };
    } catch (error) {
      console.error("Error updating test session form:", error);
      return {
        success: false,
        error: "An error occurred",
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
      const data = await apiFetch(
        `/test-session-forms/${formId}/complete`,
        {
          method: "POST",
          body: JSON.stringify(completeData),
        }
      );

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
      const data: TestSessionForm = await apiFetch<TestSessionForm>(`/test-session-forms/${formId}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching test session form:", error);
      return {
        success: false,
        error: "An error occurred",
      };
    }
  },

  /**
   * Gets all test session forms for the current user
   * @returns A promise with the list of test session forms
   */
  async getTestSessionForms(): Promise<TestSessionFormListResponse> {
    try {
      const data: TestSessionForm[] = await apiFetch<TestSessionForm[]>(`/test-session-forms/my-forms/`);

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
