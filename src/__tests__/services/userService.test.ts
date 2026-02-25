/**
 * Tests for userService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { userService } from "../../services/userService";
import { UserRole } from "../../types/enums";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockUser = {
  id: 1,
  email: "user@example.com",
  first_name: "Test",
  last_name: "User",
  role: UserRole.STUDENT,
  company_id: 1,
  instructor_id: null,
  has_completed_onboarding: true,
  is_active: true,
};

const mockUserList = [mockUser];

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("userService.getAllUsers", () => {
  it("returns users on success without company filter", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserList);

    const result = await userService.getAllUsers();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUserList);
    expect(mockApiFetch).toHaveBeenCalledWith("/users");
  });

  it("returns users on success with company filter", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUserList);

    const result = await userService.getAllUsers(5);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUserList);
    expect(mockApiFetch).toHaveBeenCalledWith("/users?company_id=5");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await userService.getAllUsers();

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while fetching users");
  });
});

describe("userService.getUserById", () => {
  it("returns user on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUser);

    const result = await userService.getUserById(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/1");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));

    const result = await userService.getUserById(999);

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while fetching user");
  });
});

describe("userService.updateUser", () => {
  it("returns updated user on success", async () => {
    const updatedUser = { ...mockUser, first_name: "Updated" };
    mockApiFetch.mockResolvedValueOnce(updatedUser);

    const userData = { first_name: "Updated" };
    const result = await userService.updateUser(1, userData);

    expect(result.success).toBe(true);
    expect(result.data?.first_name).toBe("Updated");
    expect(mockApiFetch).toHaveBeenCalledWith("/users/1", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Update failed"));

    const result = await userService.updateUser(1, { first_name: "Test" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while updating user");
  });
});

describe("userService.updatePassword", () => {
  it("returns success message on success", async () => {
    mockApiFetch.mockResolvedValueOnce({ message: "Password updated" });

    const passwordData = {
      current_password: "old",
      new_password: "new",
    };
    const result = await userService.updatePassword(1, passwordData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Password updated");
    expect(mockApiFetch).toHaveBeenCalledWith("/users/1/password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid password"));

    const result = await userService.updatePassword(1, {
      current_password: "wrong",
      new_password: "new",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while updating the password");
  });
});

describe("userService.removeUserFromCompany", () => {
  it("returns success on removal", async () => {
    mockApiFetch.mockResolvedValueOnce({});

    const result = await userService.removeUserFromCompany(1, 5);

    expect(result.success).toBe(true);
    expect(result.message).toBe("User removed from company successfully");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/companies/1/users/5",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));

    const result = await userService.removeUserFromCompany(1, 5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("An error occurred while removing the user");
  });
});

describe("userService.updateUserRole", () => {
  it("calls updateUser with role and returns updated user", async () => {
    const userWithRole = { ...mockUser, role: UserRole.INSTRUCTOR };
    mockApiFetch.mockResolvedValueOnce(userWithRole);

    const result = await userService.updateUserRole(1, UserRole.INSTRUCTOR);

    expect(result.success).toBe(true);
    expect(result.data?.role).toBe(UserRole.INSTRUCTOR);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/1", {
      method: "PATCH",
      body: JSON.stringify({ role: UserRole.INSTRUCTOR }),
    });
  });

  it("returns error when updateUser fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Update failed"));

    const result = await userService.updateUserRole(1, UserRole.INSTRUCTOR);

    expect(result.success).toBe(false);
  });
});

describe("userService.getInstructorsByCompany", () => {
  it("returns instructors on success", async () => {
    const instructors = [{ ...mockUser, role: UserRole.INSTRUCTOR }];
    mockApiFetch.mockResolvedValueOnce(instructors);

    const result = await userService.getInstructorsByCompany(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(instructors);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/users/instructors/company/1"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));

    const result = await userService.getInstructorsByCompany(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An error occurred while fetching instructors"
    );
  });
});

describe("userService.getUserWithInstructor", () => {
  it("returns user with instructor on success", async () => {
    const userWithInstructor = {
      ...mockUser,
      instructor: { ...mockUser, id: 2, role: UserRole.INSTRUCTOR },
    };
    mockApiFetch.mockResolvedValueOnce(userWithInstructor);

    const result = await userService.getUserWithInstructor(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(userWithInstructor);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/1/instructor");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));

    const result = await userService.getUserWithInstructor(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An error occurred while fetching user with instructor"
    );
  });
});

describe("userService.getInstructorWithStudents", () => {
  it("returns instructor with students on success", async () => {
    const instructorWithStudents = {
      ...mockUser,
      role: UserRole.INSTRUCTOR,
      students: [mockUser],
    };
    mockApiFetch.mockResolvedValueOnce(instructorWithStudents);

    const result = await userService.getInstructorWithStudents(2);

    expect(result.success).toBe(true);
    expect(result.data?.students).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/2/students");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));

    const result = await userService.getInstructorWithStudents(2);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An error occurred while fetching instructor with students"
    );
  });
});

describe("userService.assignStudentToInstructor", () => {
  it("returns user on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUser);

    const assignment = { student_id: 5, instructor_id: 2 };
    const result = await userService.assignStudentToInstructor(assignment);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/assign-instructor", {
      method: "POST",
      body: JSON.stringify(assignment),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Assignment failed"));

    const result = await userService.assignStudentToInstructor({
      student_id: 5,
      instructor_id: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An error occurred while assigning instructor"
    );
  });
});

describe("userService.unassignStudentFromInstructor", () => {
  it("returns user on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockUser);

    const result = await userService.unassignStudentFromInstructor(5);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/5/instructor", {
      method: "DELETE",
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unassign failed"));

    const result = await userService.unassignStudentFromInstructor(5);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "An error occurred while unassigning instructor"
    );
  });
});
