import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  User,
  UserUpdate,
  UserResponse,
  UserListResponse,
  PasswordUpdateRequest,
  MessageResponse,
  StudentInstructorAssignment,
  UserWithInstructor,
  UserWithStudents,
  UserWithInstructorResponse,
  UserWithStudentsResponse,
} from "@/src/types/auth.types";
import { UserRole } from "../types/enums";

export const userService = {
  /**
   * Get all users (optional company filter)
   * @param companyId - Optional company ID to filter users
   * @returns list of users or error message
   */
  async getAllUsers(companyId?: number): Promise<UserListResponse> {
    try {
      const url = companyId
        ? `/users?company_id=${companyId}`
        : `/users`;

      const data = await apiFetch(url);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: "An error occurred while fetching users",
      };
    }
  },

  /**
   * Get a specific user by ID
   * @param useID - ID of the user to fetch
   * @returns user data or error message
   */
  async getUserById(userId: number): Promise<UserResponse> {
    try {
      const data: User = await apiFetch<User>(`/users/${userId}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return {
        success: false,
        error: "An error occurred while fetching user",
      };
    }
  },

  /**
   * Update user details
   * @param userId - ID of the user to update
   * @param userData - Update user data
   * @returns updated user or error message
   */
  async updateUser(
    userId: number,
    userData: UserUpdate
  ): Promise<UserResponse> {
    try {
      const data: User = await apiFetch<User>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      return {
        success: false,
        error: "An error occurred while updating user",
      };
    }
  },

  /**
   * Update user password
   * @param userId - ID of the user
   * @param passwordData - Current and new password
   * @returns success message or error
   */
  async updatePassword(
    userId: number,
    passwordData: PasswordUpdateRequest
  ): Promise<MessageResponse> {
    try {
      const data = await apiFetch(`/users/${userId}/password`, {
        method: "POST",
        body: JSON.stringify(passwordData),
      });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error(`Error updating password for user ${userId}:`, error);
      return {
        success: false,
        error: "An error occurred while updating the password",
      };
    }
  },

  /**
   * Remove a user from the company
   * @param companyId = ID of the company
   * @param userId - ID of the user to remove from a company
   * @returns success message or error
   */
  async removeUserFromCompany(
    companyId: number,
    userId: number
  ): Promise<MessageResponse> {
    try {
      const response = await apiFetch(
        `/companies/${companyId}/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      return {
        success: true,
        message: "User removed from company successfully",
      };
    } catch (error) {
      console.error(
        `Error removing user ${userId} from company ${companyId}:`,
        error
      );
      return {
        success: false,
        error: "An error occurred while removing the user",
      };
    }
  },

  /**
   * Helper method to update user's role
   * @param userId - ID of the user to update
   * @param role - New role to assign
   * @returns update user or error message
   */
  async updateUserRole(userId: number, role: UserRole): Promise<UserResponse> {
    return this.updateUser(userId, { role });
  },

  /**
   * Get all instructors for a company
   * @param companyId - ID of the company
   * @returns list of instructors or error message
   */
  async getInstructorsByCompany(companyId: number): Promise<UserListResponse> {
    try {
      const data = await apiFetch(`/users/instructors/company/${companyId}`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(
        `Error fetching instructors for company ${companyId}:`,
        error
      );
      return {
        success: false,
        error: "An error occurred while fetching instructors",
      };
    }
  },

  /**
   * Get user with their instructor information
   * @param userId - ID of the user
   * @returns user with instructor data or error message
   */
  async getUserWithInstructor(
    userId: number
  ): Promise<UserWithInstructorResponse> {
    try {
      const data: UserWithInstructor = await apiFetch<UserWithInstructor>(`/users/${userId}/instructor`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error fetching user ${userId} with instructor:`, error);
      return {
        success: false,
        error: "An error occurred while fetching user with instructor",
      };
    }
  },

  /**
   * Get instructors with their students
   * @param instructorId - ID of the instructor
   * @returns instructor with students data or error message
   */
  async getInstructorWithStudents(
    instructorId: number
  ): Promise<UserWithStudentsResponse> {
    try {
      const data: UserWithStudents = await apiFetch<UserWithStudents>(`/users/${instructorId}/students`);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(
        `Error fetching instructor ${instructorId} with students:`,
        error
      );
      return {
        success: false,
        error: "An error occurred while fetching instructor with students",
      };
    }
  },

  /**
   * Assign a student to an instructor
   * @param assignment - Student-instructor assignment data
   * @returns updated student-instructor assignment or error message
   */
  async assignStudentToInstructor(
    assignment: StudentInstructorAssignment
  ): Promise<UserResponse> {
    try {
      const data: User = await apiFetch<User>(`/users/assign-instructor`, {
        method: "POST",
        body: JSON.stringify(assignment),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error assigning student to instructor:`, error);
      return {
        success: false,
        error: "An error occurred while assigning instructor",
      };
    }
  },

  /**
   * Unassign a student from their instructor
   * @param studentId - ID of the student
   * @returns updated student or error message
   */
  async unassignStudentFromInstructor(
    studentId: number
  ): Promise<UserResponse> {
    try {
      const data: User = await apiFetch<User>(`/users/${studentId}/instructor`, {
        method: "DELETE",
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(
        `Error unassigning student ${studentId} from instructor:`,
        error
      );
      return {
        success: false,
        error: "An error occurred while unassigning instructor",
      };
    }
  },
};
