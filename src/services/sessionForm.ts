import { FlatListComponent, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  SessionForm,
  CreateSessionFormRequest,
  UpdateSessionFormRequest,
  CompleteSessionFormRequest,
  SessionFormResponse,
  SessionFormListResponse,
  SessionFormCompleteResponse,
} from "../types/forms.types";

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
      const data: SessionForm = await apiFetch<SessionForm>(`/session-forms/`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

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
      const data: SessionForm = await apiFetch<SessionForm>(`/session-forms/${formId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

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
      const data = await apiFetch(
        `/session-forms/${formId}/complete`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

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
      const data: SessionForm = await apiFetch<SessionForm>(`/session-forms/${formId}`);

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
        const data: SessionForm[] = await apiFetch<SessionForm[]>(`/session-forms/my-forms/`);

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
