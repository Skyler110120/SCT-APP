/**
 * Tests for profileService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { profileService } from "../../services/profileService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("mock-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockProfile = {
  id: 1,
  user_id: 10,
  bio: "Instructor profile",
  user: {
    id: 10,
    first_name: "Jane",
    last_name: "Instructor",
    email: "jane@example.com",
  },
};

const mockInstructor = {
  id: 2,
  user_id: 11,
  bio: "Another instructor",
  user: {
    id: 11,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
  },
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("profileService.getMyProfile", () => {
  it("returns profile data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockProfile);
    const result = await profileService.getMyProfile();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockProfile);
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/me");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await profileService.getMyProfile();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Error occurred while fetching profile");
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/me");
  });
});

describe("profileService.updateMyProfile", () => {
  const profileData = { bio: "Updated bio", phone_number: "555-1234" };

  it("returns updated profile on success", async () => {
    const updatedProfile = { ...mockProfile, bio: "Updated bio" };
    mockApiFetch.mockResolvedValueOnce(updatedProfile);
    const result = await profileService.updateMyProfile(profileData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(updatedProfile);
    expect(result.message).toBe("Profile updated successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Validation failed"));
    const result = await profileService.updateMyProfile(profileData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Error occurred while updating profile");
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  });
});

describe("profileService.getUserProfile", () => {
  it("returns user profile by id on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockProfile);
    const result = await profileService.getUserProfile(10);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockProfile);
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/10");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("User not found"));
    const result = await profileService.getUserProfile(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Error occurred while fetching user profile");
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/999");
  });
});

describe("profileService.getInstructors", () => {
  it("returns instructors list on success", async () => {
    const instructors = [mockProfile, mockInstructor];
    mockApiFetch.mockResolvedValueOnce(instructors);
    const result = await profileService.getInstructors();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(instructors);
    expect(result.data).toHaveLength(2);
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/instructors");
  });

  it("returns instructors with skip/limit params on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockProfile]);
    const result = await profileService.getInstructors({ skip: 5, limit: 10 });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/profiles/instructors?skip=5&limit=10"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Unauthorized"));
    const result = await profileService.getInstructors();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Error occurred while fetching instructors");
    expect(mockApiFetch).toHaveBeenCalledWith("/profiles/instructors");
  });
});
