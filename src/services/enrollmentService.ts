import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  WeeklyProgressUpdateRequest,
  EnrollmentResponse,
  StudentProgressListResponse,
} from "../types/enrollment.types";

export const enrollmentService = {
  /**
   * Get student progress data for instructor dashboard
   * @returns Promise with student progress list or error
   */
  async getStudentProgress(): Promise<StudentProgressListResponse> {
    try {
        console.log("FETCHING STUDENT PROGRESS");

        const data = await apiFetch(`/courses/instructor/students`);

        console.log("Successfully fetched student progress:", data)

        return {
            success: true,
            data
        }
    } catch (error) {
        console.error("Error fetching student progress:", error);
        return {
            success: false,
            error: "Network error occurred while fetching student progress"
        }
    }
  },

  /**
   * Update a student's weekly progress
   * @param progressData - student progress update information
   * @returns Promise with updated enrollment data or error
   */
  async updateStudentProgress(progressData: WeeklyProgressUpdateRequest): Promise<EnrollmentResponse> {
    try {
        console.log("UPDATING STUDENT PROGRESS")
        console.log("Progress data:", progressData);

        const data = await apiFetch(`/courses/progress`, {
            method: "PATCH",
            body: JSON.stringify(progressData),
        });

        console.log("Successfully updated student progress:");

        return {
            success: true,
            data
        }
    } catch (error) {
        console.error("Error updating student progress:", error);
        return {
            success: false,
            error: "Network error occurred while updating student progress"
        }
    }
  }
};
