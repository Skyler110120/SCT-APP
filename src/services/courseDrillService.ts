import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  CourseDrill,
  CreateCourseDrillRequest,
  UpdateCourseDrillRequest,
  StudentDrillSummary,
  CourseDrillResponse,
  CourseDrillListResponse,
  StudentDrillProgressResponse,
} from "../types/course.drills.types";

export const courseDrillService = {
  /**
   * Create a new drill for a course
   * @param drillData - Data for the new drill
   * @returns A promise with the drill response
   */
  async createCourseDrill(
    drillData: CreateCourseDrillRequest
  ): Promise<CourseDrillResponse> {
    try {
      const data: CourseDrill = await apiFetch<CourseDrill>(`/course-drills/`, {
        method: "POST",
        body: JSON.stringify(drillData),
      });

      return {
        success: true,
        data,
        message: "Course drill created successfully",
      };
    } catch (error) {
      console.error("Failed to create course drill:", error);
      return {
        success: false,
        error: "Failed to create course drill",
      };
    }
  },

  /**
   * Delete a drill from a course (soft delete)
   * @param drillId - ID of the drill to delete
   * @returns A promise with the deletion response
   */
  async deleteCourseDrill(drillId: number): Promise<CourseDrillResponse> {
    try {
      const data = await apiFetch(`/course-drills/${drillId}`, {
        method: "DELETE",
      });

      return {
        success: true,
        message: data.message || "Course drill deleted successfully"
      }
    } catch (error) {
      console.error("Failed to delete course drill:", error);
      return {
        success: false,
        error: "Failed to delete course drill"
      }
    }
  },

  /**
   * Get all drills in a course
   * @param courseId - ID of the course
   * @returns A promise with the list of drills
   */
  async getCourseDrills(courseId: number): Promise<CourseDrillListResponse> {
    try {
      const data: CourseDrill[] = await apiFetch<CourseDrill[]>(`/course-drills/course/${courseId}`);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch course drills:", error);
      return {
        success: false,
        error: "Failed to fetch course drills",
      };
    }
  },

  /**
   * Update an existing drill
   * @param drillId - ID of the drill to update
   * @param drillData - Updated data for the drill
   * @returns A promise with the updated drill response
   */
  async updateCourseDrill(
    drillId: number,
    drillData: UpdateCourseDrillRequest
  ): Promise<CourseDrillResponse> {
    try {
      const data: CourseDrill = await apiFetch<CourseDrill>(`/course-drills/${drillId}`, {
        method: "PATCH",
        body: JSON.stringify(drillData),
      });

      return {
        success: true,
        data,
        message: "Course drill updated successfully",
      };
    } catch (error) {
      console.error("Failed to update course drill:", error);
      return {
        success: false,
        error: "Failed to update course drill",
      };
    }
  },

  /**
   * Get drill progress for a specific student in a course
   * @param courseId - ID of the course
   * @param studentId - ID fo the student
   * @returns A promise with the student drill progress response
   */
  async getStudentDrillProgress(
    courseId: number,
    studentId: number
  ): Promise<StudentDrillProgressResponse> {
    try {
      const data: StudentDrillSummary = await apiFetch(`/course-drills/student/${studentId}/course/${courseId}/progress`,);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch student drill progress:", error);
      return {
        success: false,
        error: "Failed to fetch student drill progress",
      };
    }
  },

  /**
   * Get current user's drill progress for a course
   * @param courseId - ID of the course
   * @returns A promise with the user's drill progress
   */
  async getMyDrillProgress(
    courseId: number
  ): Promise<StudentDrillProgressResponse> {
    try {
      const data: StudentDrillSummary = await apiFetch<StudentDrillSummary>(`/course-drills/my-progress/course/${courseId}`,);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Failed to fetch my drill progress:", error);
      return {
        success: false,
        error: "Failed to fetch my drill progress",
      };
    }
  },
};
