import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CourseSummary,
  CourseStudentView,
  CourseInstructorView,
  CourseAdminView,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseVideo,
  VideoCreateRequest,
  VideoUpdateRequest,
  CourseListResponse,
  CourseStudentResponse,
  CourseInstructorListResponse,
  CourseAdminListResponse,
  CourseResponse,
  VideoResponse,
} from "../types/course.types";

import { EnrollmentResponse, EnrollmentWithCourseResponse } from "../types/enrollment.types";

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
}

export const courseService = {
  /**
   * Get course summaries for selection during onboarding
   * @returns Promise with course list or error
   */
  async getCourseForSelection(): Promise<CourseListResponse> {
    try {
      console.log("FETCHING COURSES FOR SELECTION");

      const response = await fetch(`${API_URL}/courses/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch courses for selection:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch courses for selection",
        };
      }

      const data: CourseSummary[] = await response.json();
      console.log(
        "Successfully fetched courses for selection:",
        data.length,
        "courses"
      );

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching courses for selection:", error);
      return {
        success: false,
        error: "Network error occurred while fetching courses",
      };
    }
  },

  /**
   * Enroll student in a selected course (onboarding)
   * @param courseId - ID of the course to enroll in
   * @returns Promise with enrollment data or error
   */
  async enrollInCourse(courseId: number): Promise<EnrollmentResponse> {
    try {
      console.log("ENROLLING IN COURSE");
      console.log("Course ID:", courseId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required for enrollment",
        };
      }

      const response = await fetch(`${API_URL}/courses/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to enroll in course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to enroll in course",
        };
      }

      const data = await response.json();
      console.log("Successfully enrolled in course:");

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error enrolling in course:", error);
      return {
        success: false,
        error: "Network error occurred during enrollment",
      };
    }
  },

  /**
   * Get student's enrolled course with materials
   * @returns Promise with enrolled course data or error
   */
  async getMyEnrolledCourse(): Promise<EnrollmentWithCourseResponse> {
    try {
      console.log("FETCHING MY ENROLLED COURSE");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch enrolled course",
        };
      }

      const response = await fetch(`${API_URL}/courses/my-course`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch enrolled course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch enrolled course",
        };
      }

      const data = await response.json();
      console.log("Successfully fetchd enrolled course:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching enrolled course:", error);
      return {
        success: false,
        error: "Network error occurred while fetching enrolled course",
      };
    }
  },

  /**
   * Get all courses for instructors
   * @returns Promise with instructor course list or error
   */
  async getCoursesForInstructor(): Promise<CourseInstructorListResponse> {
    try {
      console.log("FETCHING COURSES FOR INSTRUCTOR");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch instructor courses",
        };
      }

      const response = await fetch(`${API_URL}/courses/instructor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch instructor courses:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch instructor courses",
        };
      }

      const data: CourseInstructorView[] = await response.json();
      console.log(
        "Successfully fetched instructor courses:",
        data.length,
        "courses"
      );

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      return {
        success: false,
        error: "Network error occurred while fetching instructor courses",
      };
    }
  },

  /**
   * Get all courses for admin
   * @returns Promise with admin course list or error
   */
  async getCoursesForAdmin(): Promise<CourseAdminListResponse> {
    try {
      console.log("FETCHING COURSES FOR ADMIN");

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to fetch admin courses",
        };
      }

      const response = await fetch(`${API_URL}/courses/admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch admin courses:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch admin courses",
        };
      }

      const data: CourseAdminView[] = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching admin courses:", error);
      return {
        success: false,
        error: "Network error occurred while fetching admin courses",
      };
    }
  },

  /**
   * Create a new course
   * @param courseData - Data for the new course
   * @returns Promise with created course data or error
   */
  async createCourse(courseData: CourseCreateRequest): Promise<CourseResponse> {
    try {
      console.log("CREATING NEW COURSE");
      console.log("Course Data:", courseData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to create course",
        };
      }

      const response = await fetch(`${API_URL}/courses/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create course",
        };
      }

      const data: CourseAdminView = await response.json();
      console.log("Successfully created course:", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error creating course:", error);
      return {
        success: false,
        error: "Network error occurred while creating course",
      };
    }
  },

  /**
   * Update an existing course
   * @param courseId - ID of the course to update
   * @param courseData - course information for update
   * @returns Promise with updated course data or error
   */
  async updateCourse(
    courseId: number,
    courseData: CourseUpdateRequest
  ): Promise<CourseResponse> {
    try {
      console.log("UPDATING COURSE");
      console.log("Course ID:", courseId);
      console.log("Course Data:", courseData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to update course",
        };
      }

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update course",
        };
      }

      const data: CourseAdminView = await response.json();
      console.log("Successfully updated course:", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating course:", error);
      return {
        success: false,
        error: "Network error occurred while updating course",
      };
    }
  },

  /**
   * Delete a coures
   * @param courseId - ID of the course to delete
   * @returns Promise with success status or error
   */
  async deleteCourse(courseId: number): Promise<CourseResponse> {
    try {
      console.log("DELETING COURSE");
      console.log("Course ID:", courseId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to delete course",
        };
      }

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to delete course",
        };
      }

      console.log("Successfully deleted course");
      return {
        success: true,
        message: "Course deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting course:", error);
      return {
        success: false,
        error: "Network error occurred while deleting course",
      };
    }
  },

  /**
   * Add a video to a course
   * @param courseId - ID of the course to a dd video to
   * @param videoData - Data for the new video
   * @returns Promise with created video data or error
   */
  async addVideoToCourse(
    courseId: number,
    videoData: VideoCreateRequest
  ): Promise<VideoResponse> {
    try {
      console.log("ADDING VIDEO TO COURSE");
      console.log("Course ID:", courseId);
      console.log("Video Data:", videoData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to add video to course",
        };
      }

      const response = await fetch(`${API_URL}/courses/${courseId}/videos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to add video to course:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to add video to course",
        };
      }

      const data: CourseVideo = await response.json();
      console.log("Successfully added video to course:", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error adding video to course:", error);
      return {
        success: false,
        error: "Network error occurred while adding video to course",
      };
    }
  },

  /**
   * Update a course video
   * @param videoId - ID of the video to update
   * @param videoData - video informatin for update
   * @returns Promise with updated video data or error
   */
  async updateVideo(
    videoId: number,
    videoData: VideoUpdateRequest
  ): Promise<VideoResponse> {
    try {
      console.log("UPDATING VIDEO");
      console.log("Video ID:", videoId);
      console.log("Video Data:", videoData);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to update video",
        };
      }

      const response = await fetch(`${API_URL}/courses/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update video:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update video",
        };
      }

      const data: CourseVideo = await response.json();
      console.log("Successfully updated video:", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating video:", error);
      return {
        success: false,
        error: "Network error occurred while updating video",
      };
    }
  },

  /**
   * Remove a video from a course
   * @param videoId - ID of the video to remove
   * @returns Promise with success status or error
   */
  async removeVideo(videoId: number): Promise<VideoResponse> {
    try {
      console.log("REMOVING VIDEO");
      console.log("Video ID:", videoId);

      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required to remove video",
        };
      }

      const response = await fetch(`${API_URL}/courses/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to remove video:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to remove video",
        };
      }

      console.log("Successfully removed video");
      return {
        success: true,
        message: "Video removed successfully",
      };
    } catch (error) {
      console.error("Error removing video:", error);
      return {
        success: false,
        error: "Network error occurred while removing video",
      };
    }
  },
};
