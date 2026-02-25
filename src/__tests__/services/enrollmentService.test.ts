/**
 * Tests for enrollmentService.
 * All API calls are mocked — no network needed.
 */
import { enrollmentService } from "../../services/enrollmentService";
import { ProgressionDecision } from "../../types/enrollment.types";

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

const mockStudentProgress = [
  {
    enrollment_id: 1,
    student_name: "Alice Smith",
    course_title: "Pistol Basics",
    current_week: 4,
    week_display: "Week 4 of 24",
    progress_percentage: 16.67,
    days_since_enrollment: 28,
  },
  {
    enrollment_id: 2,
    student_name: "Bob Jones",
    course_title: "Pistol Basics",
    current_week: 2,
    week_display: "Week 2 of 24",
    progress_percentage: 8.33,
    days_since_enrollment: 14,
  },
];

const mockEnrollment = {
  id: 1,
  course_id: 1,
  student_id: 20,
  status: "active",
  current_week: 5,
  progress_percentage: 20.83,
  current_month: 2,
  current_week_in_month: 1,
  week_display: "Week 5 of 24",
  enrolled_at: "2026-01-01T00:00:00Z",
  payment_required: true,
  enrollment_phase: "NORMAL",
  completed_sessions_count: 4,
  make_up_sessions_remaining: 0,
  course: {
    id: 1,
    title: "Pistol Basics",
    viewType: "student",
    required_gun_type: "Handgun",
    difficulty_level: "Beginner",
    total_weeks: 24,
    videos: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getStudentProgress
// ---------------------------------------------------------------------------

describe("enrollmentService.getStudentProgress", () => {
  it("returns student progress list on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockStudentProgress);

    const result = await enrollmentService.getStudentProgress();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].student_name).toBe("Alice Smith");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/instructor/students");
  });

  it("returns empty list when no students enrolled", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    const result = await enrollmentService.getStudentProgress();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await enrollmentService.getStudentProgress();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// updateStudentProgress
// ---------------------------------------------------------------------------

describe("enrollmentService.updateStudentProgress", () => {
  it("sends PATCH request with progress data", async () => {
    mockApiFetch.mockResolvedValueOnce(mockEnrollment);

    const progressData = {
      student_id: 20,
      decision: ProgressionDecision.APPROVED,
      notes: "Good progress",
    };

    const result = await enrollmentService.updateStudentProgress(progressData);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/courses/progress",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(progressData),
      })
    );
  });

  it("sends request without optional notes", async () => {
    mockApiFetch.mockResolvedValueOnce(mockEnrollment);

    const progressData = {
      student_id: 20,
      decision: ProgressionDecision.NEEDS_MORE,
    };

    const result = await enrollmentService.updateStudentProgress(progressData);

    expect(result.success).toBe(true);
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await enrollmentService.updateStudentProgress({
      student_id: 20,
      decision: ProgressionDecision.APPROVED,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
