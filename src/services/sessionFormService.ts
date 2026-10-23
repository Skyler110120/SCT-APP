import { apiFetch } from "./api";
import {
  SessionForm,
  SessionFormResponse,
  SessionFormListResponse,
  SessionFormCompleteResponse,
  SessionWorkflowResponse,
  CreateSessionFormRequest,
  UpdateSessionFormRequest,
  CompleteSessionFormRequest,
} from "@/src/types/forms.types";

export interface SessionParticipant {
  id: number;
  session_id: number;
  student_id: number;
  enrollment_id: number | null;
  student_name: string | null;
  student_email: string | null;
  current_week: number | null;
  enrollment_status: string | null;
  booked_week_number?: number | null;
  booked_course_id?: number | null;
  booked_course_title?: string | null;
}

export interface SessionParticipantListResponse {
  success: boolean;
  data?: SessionParticipant[];
  error?: string;
}

export const sessionFormService = {
  async createSessionForm(
    request: CreateSessionFormRequest
  ): Promise<SessionFormResponse> {
    try {
      const data: SessionForm = await apiFetch<SessionForm>(
        `/session-forms/`,
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating session form:", error);
      return {
        success: false,
        error: error?.detail || "Failed to create session form",
      };
    }
  },

  async updateSessionForm(
    formId: number,
    request: UpdateSessionFormRequest
  ): Promise<SessionFormResponse> {
    try {
      const data: SessionForm = await apiFetch<SessionForm>(
        `/session-forms/${formId}`,
        {
          method: "PUT",
          body: JSON.stringify(request),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating session form:", error);
      return {
        success: false,
        error: error?.detail || "Failed to update session form",
      };
    }
  },

  async completeSessionForm(
    formId: number,
    request: CompleteSessionFormRequest
  ): Promise<SessionFormCompleteResponse> {
    try {
      const data = await apiFetch<SessionFormCompleteResponse>(
        `/session-forms/${formId}/complete`,
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      // The API's own `success` field is authoritative when present (a 200
      // response can still semantically signal partial-failure with
      // `success: false`). If the API omits it, default to true since we
      // got here on the no-throw path. Previously this used
      // `{ success: true, ...data }` which had a duplicate key — the spread
      // silently overrode the local `success: true`, so behavior was
      // technically correct but the intent was ambiguous and TS flagged it.
      return { ...data, success: data?.success ?? true };
    } catch (error: any) {
      console.error("Error completing session form:", error);
      return {
        success: false,
        error: error?.detail || "Failed to complete session form",
      };
    }
  },

  async getSessionForm(formId: number): Promise<SessionFormResponse> {
    try {
      const data: SessionForm = await apiFetch<SessionForm>(
        `/session-forms/${formId}`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching session form:", error);
      return {
        success: false,
        error: error?.detail || "Failed to fetch session form",
      };
    }
  },

  async getFormsBySession(
    sessionId: number
  ): Promise<SessionFormListResponse> {
    try {
      const data: SessionForm[] = await apiFetch<SessionForm[]>(
        `/session-forms/session/${sessionId}`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching session forms:", error);
      return {
        success: false,
        error: error?.detail || "Failed to fetch session forms",
      };
    }
  },

  async getMyForms(): Promise<SessionFormListResponse> {
    try {
      const data: SessionForm[] = await apiFetch<SessionForm[]>(
        `/session-forms/my-forms/`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching my forms:", error);
      return {
        success: false,
        error: error?.detail || "Failed to fetch forms",
      };
    }
  },

  async getSessionParticipants(
    sessionId: number
  ): Promise<SessionParticipantListResponse> {
    try {
      const data: SessionParticipant[] = await apiFetch<SessionParticipant[]>(
        `/sessions/${sessionId}/participants`
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching session participants:", error);
      return {
        success: false,
        error: error?.detail || "Failed to fetch session participants",
      };
    }
  },

  async getSessionWorkflow(sessionId: number): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(`/session-forms/session/${sessionId}/workflow`);
      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching session workflow:", error);
      return {
        success: false,
        error: error?.detail || "Failed to fetch session workflow",
      };
    }
  },

  async submitPretraining(
    sessionId: number,
    payload: {
      student_id?: number;
      sleep_hours?: number;
      sleep_quality?: string;
      has_eaten?: boolean;
      has_pain?: boolean;
      pain_description?: string;
      pre_stress_level?: string;
      motivation_before?: number;
    }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(`/session-forms/session/${sessionId}/pretraining`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("Error submitting pretraining:", error);
      return {
        success: false,
        error: error?.detail || "Failed to submit pretraining",
      };
    }
  },

  async toggleDrill(
    sessionId: number,
    drillProgressId: number,
    payload: { student_id: number; is_completed: boolean }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(
        `/session-forms/session/${sessionId}/drills/${drillProgressId}/toggle`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error toggling drill:", error);
      return {
        success: false,
        error: error?.detail || "Failed to update drill progress",
      };
    }
  },

  async endEarly(
    sessionId: number,
    payload: { student_id: number; reason?: string }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(`/session-forms/session/${sessionId}/end-early`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("Error ending session early:", error);
      return {
        success: false,
        error: error?.detail || "Failed to end early",
      };
    }
  },

  async startPosttraining(
    sessionId: number,
    payload: { student_id: number }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(
        `/session-forms/session/${sessionId}/start-posttraining`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      console.error("Error starting posttraining:", error);
      return {
        success: false,
        error: error?.detail || "Failed to start post-training",
      };
    }
  },

  async submitPosttraining(
    sessionId: number,
    payload: {
      student_id: number;
      post_stress_level?: string;
      motivation_after?: number;
      confidence_level?: number;
      highlight?: string;
      instructor_notes?: string;
      advance_student?: boolean;
      final_passed?: boolean;
      pass_override_reason?: string;
    }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(`/session-forms/session/${sessionId}/posttraining`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("Error submitting posttraining:", error);
      return {
        success: false,
        error: error?.detail || "Failed to submit posttraining",
      };
    }
  },

  async submitParticipantSession(
    sessionId: number,
    payload: { student_id: number }
  ): Promise<SessionWorkflowResponse> {
    try {
      const data = await apiFetch(`/session-forms/session/${sessionId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error: any) {
      console.error("Error submitting participant session:", error);
      return {
        success: false,
        error: error?.detail || "Failed to submit participant session",
      };
    }
  },
};
