import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export const userService = {
  /**
   * Get all users (optional company filter)
   * @param companyId - Optional company ID to filter users
   * @returns list of users or error message
   */
  async getAllUsers(companyId?: number): Promise<UserListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const url = companyId
        ? `${API_URL}/users?company_id=${companyId}`
        : `${API_URL}/users`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to fetch users",
        };
      }

      const data = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error fetching user ${userId}:`, errorData);
        return {
          success: false,
          error: errorData.error || "Failed to fetch user",
        };
      }
      const data: User = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to update user ${userId}:`, errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to update user",
        };
      }

      const data: User = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/${userId}/password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Failed to update password for user ${userId}:`,
          errorData
        );
        return {
          success: false,
          error: errorData.detail || "Failed to update password",
        };
      }

      const data = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/companies/${companyId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Failed to remove user ${userId} from company ${companyId}:`,
          errorData
        );
        return {
          success: false,
          error: errorData.error || "Failed to remove user from company",
        };
      }

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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/users/instructors/company/${companyId}`,
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
        console.error(
          `Failed to fetch instructors for company ${companyId}:`,
          errorData
        );
        return {
          success: false,
          error: errorData.error || "Failed to fetch instructors",
        };
      }

      const data = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/${userId}/instructor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Failed to fetch user ${userId} with instructor:`,
          errorData
        );
        return {
          success: false,
          error: errorData.error || "Failed to fetch user with instructor",
        };
      }

      const data: UserWithInstructor = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/users/${instructorId}/students`,
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
        console.error(
          `Failed to fetch instructor ${instructorId} with students:`,
          errorData
        );
        return {
          success: false,
          error: errorData.error || "Failed to fetch instructor with students",
        };
      }

      const data: UserWithStudents = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/assign-instructor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to assign student to instructor:`, errorData);
        return {
          success: false,
          error: errorData.error || "Failed to assign instructor",
        };
      }

      const data: User = await response.json();
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
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/users/${studentId}/instructor`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Failed to unassign student ${studentId} from instructor:`,
          errorData
        );
        return {
          success: false,
          error: errorData.error || "Failed to unassign instructor",
        };
      }

      const data: User = await response.json();
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
