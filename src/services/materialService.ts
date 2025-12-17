import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  MaterialAccessRequest,
  MaterialAccessResponse,
  MaterialInfoResponse,
  MaterialInfoServiceResponse,
  MaterialAccessServiceResponse,
} from "../types/material.types";

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

      const data: MaterialInfoResponse = await apiFetch<MaterialInfoResponse>(`/materials/courses/${courseId}/info`);

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

      const requestBody: MaterialAccessRequest = {};

      const data: MaterialAccessResponse = await apiFetch<MaterialAccessResponse>(
        `/materials/courses/${courseId}/pdf/access`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

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

      const requestBody: MaterialAccessRequest = {};

      const data: MaterialAccessResponse = await apiFetch<MaterialAccessResponse>(`/materials/courses/${courseId}/script/access`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
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
