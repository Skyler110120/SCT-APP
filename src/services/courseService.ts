import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
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
  CourseDifficulty,
} from "../types/course.types";

import { EnrollmentResponse, EnrollmentWithCourseResponse } from "../types/enrollment.types";

export const courseService = {
  /**
   * Get course summaries for selection during onboarding
   * @returns Promise with course list or error
   */
  async getCourseForSelection(): Promise<CourseListResponse> {
    try {
      console.log("FETCHING COURSES FOR SELECTION");

      const data: CourseSummary[] = await apiFetch<CourseSummary[]>("/courses/")
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

      const data = await apiFetch(`/courses/enroll`, {
        method: "POST",
        body: JSON.stringify({
          course_id: courseId,
        }),
      });
      
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

      const data = await apiFetch("/courses/my-course");

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

      const data: CourseInstructorView[] = await apiFetch<CourseInstructorView[]>(`/courses/instructor`,);

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

      const data: CourseAdminView[] = await apiFetch<CourseAdminView[]>(`/courses/admin`)

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

      const data: CourseAdminView = await apiFetch<CourseAdminView>(`/courses/`, {
        method: "POST",
        body: JSON.stringify(courseData),
      });
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

      const data: CourseAdminView = await apiFetch<CourseAdminView>(`/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(courseData),
      });

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
   * Delete a course
   * @param courseId - ID of the course to delete
   * @returns Promise with success status or error
   */
  async deleteCourse(courseId: number): Promise<CourseResponse> {
    try {
      console.log("DELETING COURSE");
      console.log("Course ID:", courseId);

      const response = await apiFetch(`/courses/${courseId}`, {
        method: "DELETE",
      });

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

      const data: CourseVideo = await apiFetch<CourseVideo>(`/courses/${courseId}/videos`, {
        method: "POST",
        body: JSON.stringify(videoData),
      });

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

      const data: CourseVideo = await apiFetch<CourseVideo>(`/courses/videos/${videoId}`, {
        method: "PATCH",
        body: JSON.stringify(videoData),
      });

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

      const response = await apiFetch(`/courses/videos/${videoId}`, {
        method: "DELETE",
      });

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
