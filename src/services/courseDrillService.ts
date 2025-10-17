import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CourseDrill,
  CreateCourseDrillRequest,
  UpdateCourseDrillRequest,
  StudentDrillSummary,
  CourseDrillResponse,
  CourseDrillListResponse,
  StudentDrillProgressResponse,
} from "../types/course.drills.types";

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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/course-drills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(drillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create course drill:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create course drill",
        };
      }

      const data: CourseDrill = await response.json();
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
   * Get all drills in a course
   * @param courseId - ID of the course
   * @returns A promise with the list of drills
   */
  async getCourseDrills(courseId: number): Promise<CourseDrillListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/course-drills/course/${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch course drills:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch course drills",
        };
      }

      const data: CourseDrill[] = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/course-drills/${drillId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(drillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update course drill:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update course drill",
        };
      }

      const data: CourseDrill = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/course-drills/student/${studentId}/course/${courseId}/progress`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch student drill progress:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch student drill progress",
        };
      }

      const data: StudentDrillSummary = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/course-drills/my-progress/course/${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch my drill progress:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch my drill progress",
        };
      }

      const data: StudentDrillSummary = await response.json();
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
