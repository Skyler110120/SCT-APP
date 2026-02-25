jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
import { courseDrillService } from "../../services/courseDrillService";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("courseDrillService", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  describe("createCourseDrill", () => {
    it("sends POST with drill data and returns created drill", async () => {
      const drillData = { course_id: 1, name: "Draw Drill", week_number: 3, description: "Quick draw" };
      const mockDrill = { id: 10, ...drillData };
      mockApiFetch.mockResolvedValue(mockDrill);

      const result = await courseDrillService.createCourseDrill(drillData as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrill);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/", {
        method: "POST",
        body: JSON.stringify(drillData),
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.createCourseDrill({} as any);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("deleteCourseDrill", () => {
    it("sends DELETE and returns success message", async () => {
      mockApiFetch.mockResolvedValue({ message: "Deleted" });

      const result = await courseDrillService.deleteCourseDrill(5);

      expect(result.success).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/5", {
        method: "DELETE",
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.deleteCourseDrill(5);
      expect(result.success).toBe(false);
    });
  });

  describe("getCourseDrills", () => {
    it("fetches drills for a course", async () => {
      const mockDrills = [{ id: 1, name: "Drill A" }, { id: 2, name: "Drill B" }];
      mockApiFetch.mockResolvedValue(mockDrills);

      const result = await courseDrillService.getCourseDrills(3);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrills);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/course/3");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.getCourseDrills(3);
      expect(result.success).toBe(false);
    });
  });

  describe("updateCourseDrill", () => {
    it("sends PATCH with updated data", async () => {
      const updateData = { name: "Updated Drill" };
      const mockDrill = { id: 7, name: "Updated Drill" };
      mockApiFetch.mockResolvedValue(mockDrill);

      const result = await courseDrillService.updateCourseDrill(7, updateData as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrill);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/7", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.updateCourseDrill(7, {} as any);
      expect(result.success).toBe(false);
    });
  });

  describe("getStudentDrillProgress", () => {
    it("fetches drill progress for a student", async () => {
      const mockProgress = { student_id: 2, course_id: 1, drills_completed: 5, total_drills: 10 };
      mockApiFetch.mockResolvedValue(mockProgress);

      const result = await courseDrillService.getStudentDrillProgress(1, 2);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/student/2/course/1/progress");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.getStudentDrillProgress(1, 2);
      expect(result.success).toBe(false);
    });
  });

  describe("getMyDrillProgress", () => {
    it("fetches current user drill progress", async () => {
      const mockProgress = { drills_completed: 3, total_drills: 8 };
      mockApiFetch.mockResolvedValue(mockProgress);

      const result = await courseDrillService.getMyDrillProgress(4);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProgress);
      expect(mockApiFetch).toHaveBeenCalledWith("/course-drills/my-progress/course/4");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await courseDrillService.getMyDrillProgress(4);
      expect(result.success).toBe(false);
    });
  });
});
