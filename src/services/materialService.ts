import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MaterialAccessRequest,
  MaterialAccessResponse,
  MaterialInfoResponse,
  MaterialInfoServiceResponse,
  MaterialAccessServiceResponse,
} from "../types/material.types";

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

export const materialService = {
  /**
   * Get information about course materials.
   * @param courseId - ID of the course
   * @returns Promise with materials info or error
   */
  async getMaterialInfo(
    courseId: number
  ): Promise<MaterialInfoServiceResponse> {
    try {
      console.log("Fetching Material Info");
      console.log("Course ID:", courseId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to check material info",
        };
      }

      const response = await fetch(
        `${API_URL}/materials/courses/${courseId}/info`,
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
        console.error("Failed to fetch material info:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch material info",
        };
      }

      const data: MaterialInfoResponse = await response.json();
      console.log("Successfully fetched material info:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching material info:", error);
      return {
        success: false,
        error: "Network error occurred while fetching material info",
      };
    }
  },

  /**
   * Get access URL for course PDF
   * @param courseId - ID of the course
   * @returns Promise with PDF access URL or error
   */
  async getCoursePdfAccess(
    courseId: number
  ): Promise<MaterialAccessServiceResponse> {
    try {
      console.log("Requesting course PDF access");
      console.log("Course ID:", courseId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to access course PDF",
        };
      }

      const requestBody: MaterialAccessRequest = {};

      const response = await fetch(
        `${API_URL}/materials/courses/${courseId}/pdf/access`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to get PDF access:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to get PDF access",
        };
      }

      const data: MaterialAccessResponse = await response.json();
      console.log("Successfully obtained PDF access:", {
        course_id: data.course_id,
        material_type: data.material_type,
        expires_in: data.expires_in_seconds,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error getting PDF access:", error);
      return {
        success: false,
        error: "Network error occurred while getting PDF access",
      };
    }
  },

  /**
   * Get access URL for instructor script
   * @returns Promise with instructor script access URL or error
   * @param courseId - ID of the course
   */
  async getInstructorScriptAccess(courseId: number): Promise<MaterialAccessServiceResponse> {
    try {
      console.log("Requesting instructor script access");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to access instructor script",
        };
      }

      const requestBody: MaterialAccessRequest = {};

      const response = await fetch(`${API_URL}/materials/courses/${courseId}/script/access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to get instructor script:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to get instructor script access",
        };
      }

      const data: MaterialAccessResponse = await response.json();
      console.log("Successfully got instructor script access:", {
        material_type: data.material_type,
        expires_in: data.expires_in_seconds,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error getting instructor script access:", error);
      return {
        success: false,
        error: "Network error occurred while getting instructor script access",
      };
    }
  },
};
