import * as FileSystem from "expo-file-system";
import { apiFetch } from "./api";
import {
  MaterialAccessRequest,
  MaterialAccessResponse,
  MaterialInfoResponse,
  MaterialInfoServiceResponse,
  MaterialAccessServiceResponse,
  UploadUrlRequest,
  UploadUrlResponse,
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

  /**
   * Request a presigned PUT URL for uploading a course material.
   * MasterAdmin only.
   */
  async requestUploadUrl(
    request: UploadUrlRequest
  ): Promise<{ success: true; data: UploadUrlResponse } | { success: false; error: string }> {
    try {
      const data: UploadUrlResponse = await apiFetch<UploadUrlResponse>(
        "/materials/upload-url",
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return { success: true, data };
    } catch (error) {
      console.error("Error requesting upload URL:", error);
      return {
        success: false,
        error: "Failed to get upload URL",
      };
    }
  },

  /**
   * Upload a file to a presigned PUT URL (e.g. from requestUploadUrl).
   * Uses the file at fileUri and optional contentType.
   */
  async uploadFileToPresignedUrl(
    uploadUrl: string,
    fileUri: string,
    contentType?: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const headers: Record<string, string> = {};
      if (contentType) headers["Content-Type"] = contentType;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: bytes.buffer,
        headers,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Upload failed:", res.status, text);
        return { success: false, error: `Upload failed: ${res.status}` };
      }
      return { success: true };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: "Upload failed. Please try again.",
      };
    }
  },

  /**
   * Get temporary access URL for a course video (S3 or external).
   * Use this when the video has video_s3_key; otherwise use video.video_url directly.
   */
  async getVideoAccess(
    courseId: number,
    videoId: number
  ): Promise<MaterialAccessServiceResponse> {
    try {
      const data: MaterialAccessResponse = await apiFetch<MaterialAccessResponse>(
        `/materials/courses/${courseId}/videos/${videoId}/access`,
        { method: "POST" }
      );
      return { success: true, data };
    } catch (error) {
      console.error("Error getting video access:", error);
      return {
        success: false,
        error: "Failed to get video access",
      };
    }
  },
};
