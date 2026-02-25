/**
 * Tests for instructorService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { instructorService } from "../../services/instructorService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockStudent = {
  id: 1,
  user_id: 20,
  first_name: "Student",
  last_name: "One",
  email: "student@example.com",
  current_week: 2,
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("instructorService.getMyStudents", () => {
  it("returns students list on success", async () => {
    const students = [mockStudent, { ...mockStudent, id: 2, user_id: 21 }];
    mockApiFetch.mockResolvedValueOnce(students);
    const result = await instructorService.getMyStudents();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(students);
    expect(result.data).toHaveLength(2);
    expect(mockApiFetch).toHaveBeenCalledWith("/instructors/students");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await instructorService.getMyStudents();
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Network error. Please check your connection and try again later."
    );
    expect(mockApiFetch).toHaveBeenCalledWith("/instructors/students");
  });
});
