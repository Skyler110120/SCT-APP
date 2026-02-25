/**
 * Tests for courseService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { courseService } from "../../services/courseService";

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

const mockCourseSummary = {
  id: 1,
  title: "Basic Pistol",
  description: "Intro to pistols",
  required_gun_type: "Handgun",
  difficulty_level: "Beginner",
  order_index: 1,
};

const mockCourseAdminView = {
  id: 2,
  title: "Advanced Rifle",
  viewType: "admin" as const,
  required_gun_type: "Rifle",
  difficulty_level: "Advanced",
  total_weeks: 4,
  is_active: true,
  order_index: 2,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockEnrollment = {
  id: 1,
  course_id: 1,
  user_id: 10,
  enrolled_at: "2026-02-01T00:00:00Z",
};

const mockCourseVideo = {
  id: 1,
  title: "Intro Video",
  description: "Welcome video",
  video_url: "https://example.com/video.mp4",
  order_index: 1,
  week_number: 1,
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("courseService.getCourseForSelection", () => {
  it("returns course list on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockCourseSummary]);
    const result = await courseService.getCourseForSelection();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].title).toBe("Basic Pistol");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await courseService.getCourseForSelection();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/");
  });
});

describe("courseService.enrollInCourse", () => {
  it("returns enrollment data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockEnrollment);
    const result = await courseService.enrollInCourse(5);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockEnrollment);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/enroll", {
      method: "POST",
      body: JSON.stringify({ course_id: 5 }),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Enrollment failed"));
    const result = await courseService.enrollInCourse(5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/enroll", {
      method: "POST",
      body: JSON.stringify({ course_id: 5 }),
    });
  });
});

describe("courseService.getMyEnrolledCourse", () => {
  it("returns enrolled course on success", async () => {
    const enrolledWithCourse = { ...mockEnrollment, course: mockCourseSummary };
    mockApiFetch.mockResolvedValueOnce(enrolledWithCourse);
    const result = await courseService.getMyEnrolledCourse();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(enrolledWithCourse);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/my-course");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not enrolled"));
    const result = await courseService.getMyEnrolledCourse();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("courseService.getCoursesForInstructor", () => {
  it("returns instructor courses on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockCourseAdminView]);
    const result = await courseService.getCoursesForInstructor();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/instructor");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));
    const result = await courseService.getCoursesForInstructor();
    expect(result.success).toBe(false);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/instructor");
  });
});

describe("courseService.getCoursesForAdmin", () => {
  it("returns admin courses on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockCourseAdminView]);
    const result = await courseService.getCoursesForAdmin();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/admin");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));
    const result = await courseService.getCoursesForAdmin();
    expect(result.success).toBe(false);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/admin");
  });
});

describe("courseService.createCourse", () => {
  const courseData = {
    title: "New Course",
    description: "A new course",
    required_gun_type: "Handgun",
    difficulty_level: "Beginner",
    order_index: 1,
  };

  it("returns created course on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCourseAdminView);
    const result = await courseService.createCourse(courseData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCourseAdminView);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Duplicate title"));
    const result = await courseService.createCourse(courseData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  });
});

describe("courseService.updateCourse", () => {
  const updateData = { title: "Updated Title", difficulty_level: "Intermediate" };

  it("returns updated course on success", async () => {
    const updated = { ...mockCourseAdminView, title: "Updated Title" };
    mockApiFetch.mockResolvedValueOnce(updated);
    const result = await courseService.updateCourse(3, updateData);
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Updated Title");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/3", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await courseService.updateCourse(3, updateData);
    expect(result.success).toBe(false);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/3", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  });
});

describe("courseService.deleteCourse", () => {
  it("returns success and message on delete", async () => {
    mockApiFetch.mockResolvedValueOnce({});
    const result = await courseService.deleteCourse(4);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Course deleted successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/4", {
      method: "DELETE",
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Cannot delete"));
    const result = await courseService.deleteCourse(4);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/4", {
      method: "DELETE",
    });
  });
});

describe("courseService.addVideoToCourse", () => {
  const videoData = {
    title: "Week 1 Video",
    description: "Introduction",
    video_url: "https://example.com/v1.mp4",
    order_index: 1,
    week_number: 1,
  };

  it("returns created video on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCourseVideo);
    const result = await courseService.addVideoToCourse(2, videoData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCourseVideo);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/2/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid URL"));
    const result = await courseService.addVideoToCourse(2, videoData);
    expect(result.success).toBe(false);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/2/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  });
});

describe("courseService.updateVideo", () => {
  const videoUpdate = { title: "Updated Video Title" };

  it("returns updated video on success", async () => {
    const updated = { ...mockCourseVideo, title: "Updated Video Title" };
    mockApiFetch.mockResolvedValueOnce(updated);
    const result = await courseService.updateVideo(10, videoUpdate);
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Updated Video Title");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/videos/10", {
      method: "PATCH",
      body: JSON.stringify(videoUpdate),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Video not found"));
    const result = await courseService.updateVideo(10, videoUpdate);
    expect(result.success).toBe(false);
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/videos/10", {
      method: "PATCH",
      body: JSON.stringify(videoUpdate),
    });
  });
});

describe("courseService.removeVideo", () => {
  it("returns success and message on remove", async () => {
    mockApiFetch.mockResolvedValueOnce({});
    const result = await courseService.removeVideo(7);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Video removed successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/videos/7", {
      method: "DELETE",
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Cannot remove"));
    const result = await courseService.removeVideo(7);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/courses/videos/7", {
      method: "DELETE",
    });
  });
});
