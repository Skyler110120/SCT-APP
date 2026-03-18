import { apiFetch } from "./api";
import {
  Drill,
  DrillCreate,
  DrillUpdate,
  DrillResponse,
  DrillListResponse,
  CourseStructure,
  CourseStructureResponse,
  ClassWithDrills,
  ClassWithDrillsResponse,
  ClassDrill,
  ClassDrillCreate,
  CourseMonth,
  CourseMonthCreate,
  CourseMonthUpdate,
  TrainingClass,
  ClassCreate,
  ClassUpdate,
  TechnicalFundamental,
  TechnicalFundamentalCreate,
  TechnicalFundamentalUpdate,
  TechnicalFundamentalResponse,
  TechnicalFundamentalListResponse,
} from "../types/course.drills.types";

export const drillService = {
  // ── Platform Drills CRUD ───────────────────────────────────────────

  async getDrills(activeOnly: boolean = true): Promise<DrillListResponse> {
    try {
      const data = await apiFetch<Drill[]>(`/drills/?active_only=${activeOnly}`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch drills:", error);
      return { success: false, error: "Failed to fetch drills" };
    }
  },

  async getDrill(drillId: number): Promise<DrillResponse> {
    try {
      const data = await apiFetch<Drill>(`/drills/${drillId}`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch drill:", error);
      return { success: false, error: "Failed to fetch drill" };
    }
  },

  async createDrill(drillData: DrillCreate): Promise<DrillResponse> {
    try {
      const data = await apiFetch<Drill>("/drills/", {
        method: "POST",
        body: JSON.stringify(drillData),
      });
      return { success: true, data, message: "Drill created successfully" };
    } catch (error) {
      console.error("Failed to create drill:", error);
      return { success: false, error: "Failed to create drill" };
    }
  },

  async updateDrill(drillId: number, drillData: DrillUpdate): Promise<DrillResponse> {
    try {
      const data = await apiFetch<Drill>(`/drills/${drillId}`, {
        method: "PUT",
        body: JSON.stringify(drillData),
      });
      return { success: true, data, message: "Drill updated successfully" };
    } catch (error) {
      console.error("Failed to update drill:", error);
      return { success: false, error: "Failed to update drill" };
    }
  },

  async deleteDrill(drillId: number): Promise<DrillResponse> {
    try {
      await apiFetch(`/drills/${drillId}`, { method: "DELETE" });
      return { success: true, message: "Drill deleted successfully" };
    } catch (error) {
      console.error("Failed to delete drill:", error);
      return { success: false, error: "Failed to delete drill" };
    }
  },

  // ── Course Structure ───────────────────────────────────────────────

  async getCourseStructure(courseId: number): Promise<CourseStructureResponse> {
    try {
      const data = await apiFetch<CourseStructure>(`/courses/${courseId}/structure`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch course structure:", error);
      return { success: false, error: "Failed to fetch course structure" };
    }
  },

  async getClassByWeek(courseId: number, weekNumber: number): Promise<ClassWithDrillsResponse> {
    try {
      const data = await apiFetch<ClassWithDrills>(`/courses/${courseId}/weeks/${weekNumber}`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch class by week:", error);
      return { success: false, error: "Failed to fetch class" };
    }
  },

  async getClassById(courseId: number, classId: number): Promise<ClassWithDrillsResponse> {
    try {
      const data = await apiFetch<ClassWithDrills>(`/courses/${courseId}/classes/${classId}`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch class:", error);
      return { success: false, error: "Failed to fetch class" };
    }
  },

  // ── Course Months CRUD ──────────────────────────────────────────────

  async getCourseMonths(courseId: number): Promise<{ success: boolean; data?: CourseMonth[]; error?: string }> {
    try {
      const data = await apiFetch<CourseMonth[]>(`/courses/${courseId}/months`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch course months:", error);
      return { success: false, error: "Failed to fetch course months" };
    }
  },

  async createCourseMonth(
    courseId: number,
    data: CourseMonthCreate
  ): Promise<{ success: boolean; data?: CourseMonth; error?: string }> {
    try {
      const result = await apiFetch<CourseMonth>(`/courses/${courseId}/months`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to create course month:", error);
      return { success: false, error: "Failed to create course month" };
    }
  },

  async updateCourseMonth(
    courseId: number,
    monthId: number,
    data: CourseMonthUpdate
  ): Promise<{ success: boolean; data?: CourseMonth; error?: string }> {
    try {
      const result = await apiFetch<CourseMonth>(`/courses/${courseId}/months/${monthId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to update course month:", error);
      return { success: false, error: "Failed to update course month" };
    }
  },

  async deleteCourseMonth(
    courseId: number,
    monthId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch(`/courses/${courseId}/months/${monthId}`, { method: "DELETE" });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete course month:", error);
      return { success: false, error: "Failed to delete course month" };
    }
  },

  // ── Classes CRUD ────────────────────────────────────────────────────

  async getClasses(
    courseId: number,
    monthId: number
  ): Promise<{ success: boolean; data?: TrainingClass[]; error?: string }> {
    try {
      const data = await apiFetch<TrainingClass[]>(`/courses/${courseId}/months/${monthId}/classes`);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      return { success: false, error: "Failed to fetch classes" };
    }
  },

  async createClass(
    courseId: number,
    monthId: number,
    data: ClassCreate
  ): Promise<{ success: boolean; data?: TrainingClass; error?: string }> {
    try {
      const result = await apiFetch<TrainingClass>(
        `/courses/${courseId}/months/${monthId}/classes`,
        { method: "POST", body: JSON.stringify(data) }
      );
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to create class:", error);
      return { success: false, error: "Failed to create class" };
    }
  },

  async updateClass(
    courseId: number,
    classId: number,
    data: ClassUpdate
  ): Promise<{ success: boolean; data?: TrainingClass; error?: string }> {
    try {
      const result = await apiFetch<TrainingClass>(`/courses/${courseId}/classes/${classId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to update class:", error);
      return { success: false, error: "Failed to update class" };
    }
  },

  async deleteClass(courseId: number, classId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch(`/courses/${courseId}/classes/${classId}`, { method: "DELETE" });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete class:", error);
      return { success: false, error: "Failed to delete class" };
    }
  },

  // ── Class Drill Assignments ────────────────────────────────────────

  async addDrillToClass(
    courseId: number,
    classId: number,
    data: ClassDrillCreate
  ): Promise<{ success: boolean; data?: ClassDrill; error?: string }> {
    try {
      const result = await apiFetch<ClassDrill>(
        `/courses/${courseId}/classes/${classId}/drills`,
        { method: "POST", body: JSON.stringify(data) }
      );
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to add drill to class:", error);
      return { success: false, error: "Failed to add drill to class" };
    }
  },

  async removeDrillFromClass(
    courseId: number,
    classId: number,
    drillId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch(`/courses/${courseId}/classes/${classId}/drills/${drillId}`, {
        method: "DELETE",
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to remove drill from class:", error);
      return { success: false, error: "Failed to remove drill from class" };
    }
  },

  // ── Technical Fundamentals ─────────────────────────────────────────

  async getFundamentals(): Promise<TechnicalFundamentalListResponse> {
    try {
      const data = await apiFetch<TechnicalFundamental[]>("/technical-fundamentals/");
      return { success: true, data };
    } catch (error) {
      console.error("Failed to fetch fundamentals:", error);
      return { success: false, error: "Failed to fetch fundamentals" };
    }
  },

  async createFundamental(
    data: TechnicalFundamentalCreate
  ): Promise<TechnicalFundamentalResponse> {
    try {
      const result = await apiFetch<TechnicalFundamental>("/technical-fundamentals/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to create fundamental:", error);
      return { success: false, error: "Failed to create fundamental" };
    }
  },

  async updateFundamental(
    id: number,
    data: TechnicalFundamentalUpdate
  ): Promise<TechnicalFundamentalResponse> {
    try {
      const result = await apiFetch<TechnicalFundamental>(
        `/technical-fundamentals/${id}`,
        { method: "PUT", body: JSON.stringify(data) }
      );
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to update fundamental:", error);
      return { success: false, error: "Failed to update fundamental" };
    }
  },

  async deleteFundamental(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch(`/technical-fundamentals/${id}`, { method: "DELETE" });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete fundamental:", error);
      return { success: false, error: "Failed to delete fundamental" };
    }
  },
};

/** @deprecated Use drillService instead */
export const courseDrillService = drillService;
