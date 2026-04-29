/**
 * Tests for testSessionFormService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { testSessionFormService } from "../../services/testSessionFormService";
import { SleepQuality, PreStressLevel, PostStressLevel } from "../../types/enums";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("mock-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockTestSessionForm = {
  id: 1,
  session_id: 10,
  instructor_id: 5,
  student_id: 20,
  course_id: 1,
  week_number: 2,
  sleep_hours: 7,
  sleep_quality: SleepQuality.AVERAGE,
  has_eaten: true,
  has_pain: false,
  pre_stress_level: PreStressLevel.LOW,
  motivation_before: 8,
  post_stress_level: PostStressLevel.LESS_STRESSED,
  motivation_after: 9,
  confidence_level: 8,
  advance_student: true,
  is_completed: false,
  created_at: "2026-02-20T10:00:00Z",
  updated_at: "2026-02-20T10:00:00Z",
};

const mockCompleteResponse = {
  form_id: 1,
  student_advanced: true,
  session_completed: true,
  student_id: 20,
  course_id: 1,
  week_completed: 2,
  message: "Test session form completed successfully",
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("testSessionFormService.createTestSessionForm", () => {
  const formData = { session_id: 10 };

  it("returns created form on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockTestSessionForm);
    const result = await testSessionFormService.createTestSessionForm(formData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTestSessionForm);
    expect(result.message).toBe("Test session form created successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Session not found"));
    const result = await testSessionFormService.createTestSessionForm(formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create test session form");
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  });
});

describe("testSessionFormService.updateTestSessionForm", () => {
  const updateData = { sleep_hours: 8, motivation_before: 9 };

  it("returns updated form on success", async () => {
    const updated = { ...mockTestSessionForm, sleep_hours: 8 };
    mockApiFetch.mockResolvedValueOnce(updated);
    const result = await testSessionFormService.updateTestSessionForm(
      1,
      updateData
    );
    expect(result.success).toBe(true);
    expect(result.data?.sleep_hours).toBe(8);
    expect(result.message).toBe("Test session form updated successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/1", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Form not found"));
    const result = await testSessionFormService.updateTestSessionForm(
      999,
      updateData
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update test session form");
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/999", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  });
});

describe("testSessionFormService.completeTestSessionForm", () => {
  const completeData = {
    post_stress_level: PostStressLevel.LESS_STRESSED,
    confidence_level: 8,
    advance_student: true,
  };

  it("returns complete response on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCompleteResponse);
    const result = await testSessionFormService.completeTestSessionForm(
      1,
      completeData
    );
    expect(result.success).toBe(true);
    expect(result.form_id).toBe(1);
    expect(result.student_advanced).toBe(true);
    expect(result.session_completed).toBe(true);
    expect(result.student_id).toBe(20);
    expect(result.course_id).toBe(1);
    expect(result.week_completed).toBe(2);
    expect(result.message).toBe("Test session form completed successfully");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/test-session-forms/1/complete",
      { method: "POST", body: JSON.stringify(completeData) }
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Already completed"));
    const result = await testSessionFormService.completeTestSessionForm(
      1,
      completeData
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe("An unexpected error occurred");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/test-session-forms/1/complete",
      { method: "POST", body: JSON.stringify(completeData) }
    );
  });
});

describe("testSessionFormService.getTestSessionForm", () => {
  it("returns form by id on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockTestSessionForm);
    const result = await testSessionFormService.getTestSessionForm(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTestSessionForm);
    expect(result.data?.id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/1");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await testSessionFormService.getTestSessionForm(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to fetch test session form");
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/999");
  });
});

describe("testSessionFormService.getTestSessionForms", () => {
  it("returns list of forms on success", async () => {
    const forms = [
      mockTestSessionForm,
      { ...mockTestSessionForm, id: 2, session_id: 11 },
    ];
    mockApiFetch.mockResolvedValueOnce(forms);
    const result = await testSessionFormService.getTestSessionForms();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/test-session-forms/my-forms/"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));
    const result = await testSessionFormService.getTestSessionForms();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to fetch test session forms");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/test-session-forms/my-forms/"
    );
  });

  it("aliases getMyTestSessionForms to getTestSessionForms", async () => {
    mockApiFetch.mockResolvedValueOnce([mockTestSessionForm]);
    const result = await testSessionFormService.getMyTestSessionForms();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/test-session-forms/my-forms/");
  });
});
