jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
import { drillService } from "../../services/courseDrillService";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("drillService", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  // ── getDrills ──────────────────────────────────────────────────────

  describe("getDrills", () => {
    it("fetches all active drills", async () => {
      const mockDrills = [
        { id: 1, name: "Bill Drill", fire_type: "LIVE_FIRE", fundamentals: [] },
        { id: 2, name: "Wall Drill", fire_type: "DRY_FIRE", fundamentals: [] },
      ];
      mockApiFetch.mockResolvedValue(mockDrills);

      const result = await drillService.getDrills();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrills);
      expect(mockApiFetch).toHaveBeenCalledWith("/drills/?active_only=true");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.getDrills();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ── getDrill ───────────────────────────────────────────────────────

  describe("getDrill", () => {
    it("fetches a single drill by ID", async () => {
      const mockDrill = { id: 1, name: "Bill Drill", fundamentals: [] };
      mockApiFetch.mockResolvedValue(mockDrill);

      const result = await drillService.getDrill(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrill);
      expect(mockApiFetch).toHaveBeenCalledWith("/drills/1");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.getDrill(1);
      expect(result.success).toBe(false);
    });
  });

  // ── createDrill ────────────────────────────────────────────────────

  describe("createDrill", () => {
    it("sends POST with drill data", async () => {
      const drillData = {
        name: "Draw Drill",
        purpose: "Speed",
        fire_type: "LIVE_FIRE" as const,
        loadout: "2×10",
      };
      const mockDrill = { id: 10, ...drillData, fundamentals: [] };
      mockApiFetch.mockResolvedValue(mockDrill);

      const result = await drillService.createDrill(drillData as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrill);
      expect(mockApiFetch).toHaveBeenCalledWith("/drills/", {
        method: "POST",
        body: JSON.stringify(drillData),
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.createDrill({} as any);
      expect(result.success).toBe(false);
    });
  });

  // ── updateDrill ────────────────────────────────────────────────────

  describe("updateDrill", () => {
    it("sends PUT with updated data", async () => {
      const updateData = { name: "Updated Drill" };
      const mockDrill = { id: 7, name: "Updated Drill", fundamentals: [] };
      mockApiFetch.mockResolvedValue(mockDrill);

      const result = await drillService.updateDrill(7, updateData as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDrill);
      expect(mockApiFetch).toHaveBeenCalledWith("/drills/7", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.updateDrill(7, {} as any);
      expect(result.success).toBe(false);
    });
  });

  // ── deleteDrill ────────────────────────────────────────────────────

  describe("deleteDrill", () => {
    it("sends DELETE and returns success", async () => {
      mockApiFetch.mockResolvedValue({ success: true });

      const result = await drillService.deleteDrill(5);

      expect(result.success).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith("/drills/5", {
        method: "DELETE",
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.deleteDrill(5);
      expect(result.success).toBe(false);
    });
  });

  // ── getCourseStructure ─────────────────────────────────────────────

  describe("getCourseStructure", () => {
    it("fetches full course structure", async () => {
      const mockStructure = {
        course_id: 1,
        course_title: "Pistol 101",
        total_weeks: 24,
        months: [],
      };
      mockApiFetch.mockResolvedValue(mockStructure);

      const result = await drillService.getCourseStructure(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStructure);
      expect(mockApiFetch).toHaveBeenCalledWith("/courses/1/structure");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.getCourseStructure(1);
      expect(result.success).toBe(false);
    });
  });

  // ── getClassByWeek ─────────────────────────────────────────────────

  describe("getClassByWeek", () => {
    it("fetches class for a specific week", async () => {
      const mockClass = {
        id: 1,
        week_index: 1,
        title: "Week 1 Class",
        class_drills: [],
        global_week_number: 1,
      };
      mockApiFetch.mockResolvedValue(mockClass);

      const result = await drillService.getClassByWeek(1, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockClass);
      expect(mockApiFetch).toHaveBeenCalledWith("/courses/1/weeks/1");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.getClassByWeek(1, 1);
      expect(result.success).toBe(false);
    });
  });

  // ── getFundamentals ────────────────────────────────────────────────

  describe("getFundamentals", () => {
    it("fetches all technical fundamentals", async () => {
      const mockFundamentals = [
        { id: 1, name: "Grip" },
        { id: 2, name: "Trigger Control" },
      ];
      mockApiFetch.mockResolvedValue(mockFundamentals);

      const result = await drillService.getFundamentals();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFundamentals);
      expect(mockApiFetch).toHaveBeenCalledWith("/technical-fundamentals/");
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.getFundamentals();
      expect(result.success).toBe(false);
    });
  });

  // ── addDrillToClass ────────────────────────────────────────────────

  describe("addDrillToClass", () => {
    it("sends POST to add drill to class", async () => {
      const data = { drill_id: 5, is_homework: false, display_order: 1 };
      const mockResult = { id: 1, class_id: 3, ...data, drill: { id: 5, name: "Bill Drill" } };
      mockApiFetch.mockResolvedValue(mockResult);

      const result = await drillService.addDrillToClass(1, 3, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockApiFetch).toHaveBeenCalledWith("/courses/1/classes/3/drills", {
        method: "POST",
        body: JSON.stringify(data),
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.addDrillToClass(1, 3, { drill_id: 5 } as any);
      expect(result.success).toBe(false);
    });
  });

  // ── removeDrillFromClass ───────────────────────────────────────────

  describe("removeDrillFromClass", () => {
    it("sends DELETE to remove drill from class", async () => {
      mockApiFetch.mockResolvedValue(undefined);

      const result = await drillService.removeDrillFromClass(1, 3, 5);

      expect(result.success).toBe(true);
      expect(mockApiFetch).toHaveBeenCalledWith("/courses/1/classes/3/drills/5", {
        method: "DELETE",
      });
    });

    it("returns error on failure", async () => {
      mockApiFetch.mockRejectedValue(new Error("fail"));
      const result = await drillService.removeDrillFromClass(1, 3, 5);
      expect(result.success).toBe(false);
    });
  });
});
