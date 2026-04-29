/**
 * Tests for sessionFormService.
 * All API calls are mocked via jest.mock so no network is needed.
 */
import { sessionFormService } from "../../services/sessionFormService";
import { SleepQuality, PreStressLevel, PostStressLevel } from "../../types/enums";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockForm = {
  id: 1,
  session_id: 10,
  instructor_id: 5,
  student_id: 20,
  course_id: 3,
  week_number: 4,
  sleep_hours: 7,
  sleep_quality: SleepQuality.AVERAGE,
  has_eaten: true,
  has_pain: false,
  pain_description: null,
  pre_stress_level: PreStressLevel.LOW,
  motivation_before: 8,
  post_stress_level: PostStressLevel.LESS_STRESSED,
  motivation_after: 9,
  confidence_level: 8,
  highlight: "Great grouping",
  advance_student: true,
  instructor_notes: "Good session",
  is_completed: false,
  completed_at: null,
  created_at: "2026-02-20T10:00:00Z",
};

const mockParticipant = {
  id: 1,
  session_id: 10,
  student_id: 20,
  enrollment_id: 15,
  student_name: "John Doe",
  student_email: "john@example.com",
  current_week: 4,
  enrollment_status: "active",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sessionFormService.createSessionForm", () => {
  it("returns success with form data on create", async () => {
    mockApiFetch.mockResolvedValueOnce(mockForm);
    const result = await sessionFormService.createSessionForm({
      session_id: 10,
      student_id: 20,
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockForm);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/", {
      method: "POST",
      body: JSON.stringify({ session_id: 10, student_id: 20 }),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Server error"));
    const result = await sessionFormService.createSessionForm({ session_id: 10 });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("sessionFormService.updateSessionForm", () => {
  it("returns updated form data", async () => {
    const updated = { ...mockForm, sleep_hours: 8 };
    mockApiFetch.mockResolvedValueOnce(updated);
    const result = await sessionFormService.updateSessionForm(1, {
      sleep_hours: 8,
    });
    expect(result.success).toBe(true);
    expect(result.data?.sleep_hours).toBe(8);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/1", {
      method: "PUT",
      body: JSON.stringify({ sleep_hours: 8 }),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await sessionFormService.updateSessionForm(999, {});
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.completeSessionForm", () => {
  it("returns success response with completion data", async () => {
    const completeResponse = {
      success: true,
      message: "Session form completed successfully",
      form_id: 1,
      student_advanced: true,
      session_completed: true,
    };
    mockApiFetch.mockResolvedValueOnce(completeResponse);
    const result = await sessionFormService.completeSessionForm(1, {
      post_stress_level: PostStressLevel.LESS_STRESSED,
      confidence_level: 8,
      advance_student: true,
    });
    expect(result.success).toBe(true);
    expect(result.student_advanced).toBe(true);
    expect(result.session_completed).toBe(true);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Already completed"));
    const result = await sessionFormService.completeSessionForm(1, {
      post_stress_level: PostStressLevel.SAME,
      confidence_level: 5,
      advance_student: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.getSessionForm", () => {
  it("returns single form by id", async () => {
    mockApiFetch.mockResolvedValueOnce(mockForm);
    const result = await sessionFormService.getSessionForm(1);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/1");
  });

  it("returns error when form not found", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await sessionFormService.getSessionForm(999);
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.getFormsBySession", () => {
  it("returns all forms for a session", async () => {
    const forms = [mockForm, { ...mockForm, id: 2, student_id: 21 }];
    mockApiFetch.mockResolvedValueOnce(forms);
    const result = await sessionFormService.getFormsBySession(10);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/session/10");
  });

  it("returns empty array when no forms exist", async () => {
    mockApiFetch.mockResolvedValueOnce([]);
    const result = await sessionFormService.getFormsBySession(10);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));
    const result = await sessionFormService.getFormsBySession(10);
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.getMyForms", () => {
  it("returns list of forms", async () => {
    mockApiFetch.mockResolvedValueOnce([mockForm]);
    const result = await sessionFormService.getMyForms();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/my-forms/");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Server error"));
    const result = await sessionFormService.getMyForms();
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.getSessionParticipants", () => {
  it("returns participants with student info", async () => {
    const participants = [mockParticipant, { ...mockParticipant, id: 2, student_id: 21, student_name: "Jane Doe" }];
    mockApiFetch.mockResolvedValueOnce(participants);
    const result = await sessionFormService.getSessionParticipants(10);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].student_name).toBe("John Doe");
    expect(result.data![0].current_week).toBe(4);
    expect(mockApiFetch).toHaveBeenCalledWith("/sessions/10/participants");
  });

  it("returns empty array when no participants", async () => {
    mockApiFetch.mockResolvedValueOnce([]);
    const result = await sessionFormService.getSessionParticipants(10);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await sessionFormService.getSessionParticipants(999);
    expect(result.success).toBe(false);
  });
});

describe("sessionFormService.getSessionWorkflow", () => {
  it("returns workflow for a session", async () => {
    const workflow = {
      session_id: 10,
      participants: [{ student_id: 20, pretraining_status: "NOT_STARTED" }],
    };
    mockApiFetch.mockResolvedValueOnce(workflow);
    const result = await sessionFormService.getSessionWorkflow(10);
    expect(result.success).toBe(true);
    expect(result.data?.session_id).toBe(10);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/session/10/workflow");
  });
});

describe("sessionFormService.submitPretraining", () => {
  it("submits student check-in payload", async () => {
    const payload = {
      sleep_hours: 8,
      has_eaten: true,
      motivation_before: 7,
    };
    mockApiFetch.mockResolvedValueOnce({
      session_id: 10,
      participants: [{ student_id: 20, pretraining_status: "COMPLETED" }],
    });
    const result = await sessionFormService.submitPretraining(10, payload);
    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/session-forms/session/10/pretraining", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });
});
