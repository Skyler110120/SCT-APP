import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  EnrollmentCreateRequest,
  WeeklyProgressUpdateRequest,
  EnrollmentResponse,
  EnrollmentWithCourseResponse,
  StudentProgressListResponse,
  ProgressionDecision,
} from "../types/enrollment.types";

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
} else {
  API_URL = "https://your-production-api.com";
}

export const enrollmentService = {
  /**
   * Get student progress data for instructor dashboard
   * @returns Promise with student progress list or error
   */
  async getStudentProgress(): Promise<StudentProgressListResponse> {
    try {
        console.log("FETCHING STUDENT PROGRESS");

        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
            console.error("No authentication token found");
            return {
                success: false,
                error: "User not authenticated"
            };
        }

        const response = await fetch(`${API_URL}/courses/instructor/students`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching student progress:", errorData);
            return {
                success: false,
                error: errorData.detail || "Failed to fetch student progress"
            };
        }

        const data = await response.json();
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

        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
            console.error("No authentication token found");
            return {
                success: false,
                error: "Authentication required to update student"
            };
        }

        const response = await fetch(`${API_URL}/courses/progress`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(progressData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error updating student progress:", errorData);
            return {
                success: false,
                error: errorData.detail || "Failed to update student progress"
            }
        }

        const data = await response.json();
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
