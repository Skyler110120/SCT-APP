/**
 * Tests for onboardingService.
 * Covers the updated flow where instructor selection is NOT required for students.
 */
import { onboardingService } from "../../services/onboardingService";
import { UserRole } from "../../types/enums";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((k) => delete mockStorage[k]);
    return Promise.resolve();
  }),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
  // Clear the mock storage
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

// ---------------------------------------------------------------------------
// validateCompanyCode
// ---------------------------------------------------------------------------

describe("onboardingService.validateCompanyCode", () => {
  const mockCompanyInfo = {
    company_id: 1,
    company_name: "Test Range",
    role: UserRole.STUDENT,
  };

  it("returns success with company data on valid code", async () => {
    mockApiFetch.mockResolvedValueOnce(mockCompanyInfo);

    const result = await onboardingService.validateCompanyCode("VALID-CODE");

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCompanyInfo);
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await onboardingService.validateCompanyCode("BAD-CODE");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createSignupDataFromOnboarding — no instructor required (TASK-ONB-004)
// ---------------------------------------------------------------------------

describe("onboardingService.createSignupDataFromOnboarding", () => {
  const setupStorage = async (overrides: Record<string, unknown> = {}) => {
    const defaults = {
      inviteCode: "CODE123",
      companyInfo: { company_id: 1, company_name: "Range", role: UserRole.STUDENT },
      selectedRole: UserRole.STUDENT,
      selectedCourse: { id: 2, title: "Pistol Basics" },
    };
    const data = { ...defaults, ...overrides };
    for (const [key, value] of Object.entries(data)) {
      mockStorage[`onboarding_${key}`] = JSON.stringify(value);
    }
  };

  it("assembles signup data without instructor_id (TASK-ONB-004)", async () => {
    await setupStorage();

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "student@test.com",
      password: "ValidPass1",
      first_name: "Alice",
      last_name: "Smith",
      confirm_password: "ValidPass1",
    });

    expect(result).not.toBeNull();
    expect(result!.instructor_id).toBeNull();
    expect(result!.course_id).toBe(2);
    expect(result!.email).toBe("student@test.com");
    expect(result!.invite_code).toBe("CODE123");
  });

  it("returns null when invite code is missing", async () => {
    await setupStorage({ inviteCode: undefined });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "test@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
    });

    expect(result).toBeNull();
  });

  it("returns null when student has no course selected", async () => {
    await setupStorage({ selectedCourse: undefined });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "test@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
    });

    expect(result).toBeNull();
  });

  it("succeeds for non-student role without course and sets course_id to null", async () => {
    await setupStorage({
      selectedRole: UserRole.ADMIN,
      companyInfo: { company_id: 1, company_name: "Range", role: UserRole.ADMIN },
      selectedCourse: undefined,
    });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "admin@test.com",
      password: "ValidPass1",
      first_name: "Admin",
      last_name: "User",
      confirm_password: "ValidPass1",
    });

    expect(result).not.toBeNull();
    expect(result!.role).toBe(UserRole.ADMIN);
    expect(result!.course_id).toBeNull();
  });

  it("uses role from companyInfo with fallback to intendedRole", async () => {
    await setupStorage({
      companyInfo: { company_id: 1, company_name: "Range", role: UserRole.INSTRUCTOR },
      selectedRole: UserRole.STUDENT,
      selectedCourse: { id: 2, title: "Course" },
    });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "u@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
    });

    expect(result).not.toBeNull();
    expect(result!.role).toBe(UserRole.INSTRUCTOR);
  });

  it("uses intendedRole when companyInfo.role is missing", async () => {
    await setupStorage({
      companyInfo: { company_id: 1, company_name: "Range" } as any,
      selectedRole: UserRole.ADMIN,
      selectedCourse: undefined,
    });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "admin@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
    });

    expect(result).not.toBeNull();
    expect(result!.role).toBe(UserRole.ADMIN);
    expect(result!.course_id).toBeNull();
  });

  it("uses registrationData.courseId as fallback when selectedCourse is in storage", async () => {
    await setupStorage({
      selectedRole: UserRole.STUDENT,
      selectedCourse: { id: 2, title: "Pistol Basics" },
    });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "u@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
      courseId: 99,
    });

    expect(result).not.toBeNull();
    expect(result!.course_id).toBe(2);
  });

  it("returns null when student has no course in storage even if registrationData.courseId is set", async () => {
    await setupStorage({
      selectedRole: UserRole.STUDENT,
      selectedCourse: undefined,
    });

    const result = await onboardingService.createSignupDataFromOnboarding({
      email: "u@test.com",
      password: "ValidPass1",
      first_name: "A",
      last_name: "B",
      confirm_password: "ValidPass1",
      courseId: 99,
    });

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isOnboardingDataComplete — instructor no longer required (TASK-ONB-004)
// ---------------------------------------------------------------------------

describe("onboardingService.isOnboardingDataComplete", () => {
  it("returns true for student with invite code, company, role, and form data", async () => {
    mockStorage["onboarding_inviteCode"] = JSON.stringify("CODE");
    mockStorage["onboarding_companyInfo"] = JSON.stringify({ company_id: 1 });
    mockStorage["onboarding_selectedRole"] = JSON.stringify(UserRole.STUDENT);
    mockStorage["onboarding_formData"] = JSON.stringify({ email: "a@b.com" });

    // No instructor stored — should still pass after TASK-ONB-004

    const result = await onboardingService.isOnboardingDataComplete();
    expect(result).toBe(true);
  });

  it("returns false when invite code is missing", async () => {
    mockStorage["onboarding_companyInfo"] = JSON.stringify({ company_id: 1 });
    mockStorage["onboarding_selectedRole"] = JSON.stringify(UserRole.STUDENT);
    mockStorage["onboarding_formData"] = JSON.stringify({ email: "a@b.com" });

    const result = await onboardingService.isOnboardingDataComplete();
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyInstructors
// ---------------------------------------------------------------------------

describe("onboardingService.getCompanyInstructors", () => {
  it("returns instructor list on success", async () => {
    const instructors = [
      { id: 1, email: "ins1@test.com", first_name: "John", last_name: "Doe" },
      { id: 2, email: "ins2@test.com", first_name: "Jane", last_name: "Smith" },
    ];
    mockApiFetch.mockResolvedValueOnce(instructors);

    const result = await onboardingService.getCompanyInstructors(1);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(mockApiFetch).toHaveBeenCalledWith("/users/instructors/company/1");
  });

  it("returns empty list for company with no instructors", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    const result = await onboardingService.getCompanyInstructors(1);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await onboardingService.getCompanyInstructors(1);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// completeOnboarding (legacy flow)
// ---------------------------------------------------------------------------

describe("onboardingService.completeOnboarding", () => {
  it("returns success on valid code", async () => {
    mockApiFetch.mockResolvedValueOnce({ user_id: 1, email: "test@test.com" });

    const result = await onboardingService.completeOnboarding("VALID");

    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/onboarding/complete",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await onboardingService.completeOnboarding("BAD");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// clearOnboardingData
// ---------------------------------------------------------------------------

describe("onboardingService.clearOnboardingData", () => {
  it("calls multiRemove with all onboarding keys", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");

    await onboardingService.clearOnboardingData();

    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    const removedKeys: string[] = AsyncStorage.multiRemove.mock.calls[0][0];
    expect(removedKeys).toContain("onboarding_invite_code");
    expect(removedKeys).toContain("onboarding_company_info");
    expect(removedKeys).toContain("onboarding_selected_role");
    expect(removedKeys).toContain("onboarding_selected_course");
    expect(removedKeys).toContain("onboarding_form_data");
  });
});

// ---------------------------------------------------------------------------
// getOnboardingProgress
// ---------------------------------------------------------------------------

describe("onboardingService.getOnboardingProgress", () => {
  it("returns complete progress when all data present", async () => {
    mockStorage["onboarding_inviteCode"] = JSON.stringify("CODE");
    mockStorage["onboarding_companyInfo"] = JSON.stringify({ company_id: 1 });
    mockStorage["onboarding_selectedRole"] = JSON.stringify(UserRole.STUDENT);
    mockStorage["onboarding_selectedInstructor"] = JSON.stringify({ id: 1 });
    mockStorage["onboarding_formData"] = JSON.stringify({ email: "a@b.com" });

    const progress = await onboardingService.getOnboardingProgress();

    expect(progress.hasInviteCode).toBe(true);
    expect(progress.hasCompanyInfo).toBe(true);
    expect(progress.hasSelectedRole).toBe(true);
    expect(progress.hasFormData).toBe(true);
    expect(progress.isComplete).toBe(true);
  });

  it("identifies missing invite code as next step", async () => {
    // Empty storage
    const progress = await onboardingService.getOnboardingProgress();

    expect(progress.hasInviteCode).toBe(false);
    expect(progress.isComplete).toBe(false);
    expect(progress.nextStepNeeded).toBe("Enter invite code");
  });

  it("identifies missing company info as next step", async () => {
    mockStorage["onboarding_inviteCode"] = JSON.stringify("CODE");

    const progress = await onboardingService.getOnboardingProgress();

    expect(progress.hasInviteCode).toBe(true);
    expect(progress.hasCompanyInfo).toBe(false);
    expect(progress.nextStepNeeded).toBe("Validate company information");
  });

  it("identifies missing role as next step", async () => {
    mockStorage["onboarding_inviteCode"] = JSON.stringify("CODE");
    mockStorage["onboarding_companyInfo"] = JSON.stringify({ company_id: 1 });

    const progress = await onboardingService.getOnboardingProgress();

    expect(progress.hasSelectedRole).toBe(false);
    expect(progress.nextStepNeeded).toBe("Select your role");
  });

  it("identifies missing form data as next step", async () => {
    mockStorage["onboarding_inviteCode"] = JSON.stringify("CODE");
    mockStorage["onboarding_companyInfo"] = JSON.stringify({ company_id: 1 });
    mockStorage["onboarding_selectedRole"] = JSON.stringify(UserRole.STUDENT);

    const progress = await onboardingService.getOnboardingProgress();

    expect(progress.hasFormData).toBe(false);
    expect(progress.nextStepNeeded).toBe("Complete personal information");
  });
});

// ---------------------------------------------------------------------------
// saveOnboardingData / getOnboardingData round-trip
// ---------------------------------------------------------------------------

describe("onboardingService save/get data round-trip", () => {
  it("saves and retrieves invite code", async () => {
    await onboardingService.saveInviteCode("TEST-CODE");
    const result = await onboardingService.getStoredInviteCode();
    expect(result).toBe("TEST-CODE");
  });

  it("saves and retrieves company info", async () => {
    const info = { company_id: 1, company_name: "Test", role: UserRole.STUDENT };
    await onboardingService.saveCompanyInfo(info as any);
    const result = await onboardingService.getStoredCompanyInfo();
    expect(result).toEqual(info);
  });

  it("saves and retrieves selected course", async () => {
    const course = { id: 1, title: "Pistol Basics", difficulty_level: "Beginner", required_gun_type: "Handgun", order_index: 1 };
    await onboardingService.saveSelectedCourse(course as any);
    const result = await onboardingService.getStoredSelectedCourse();
    expect(result).toEqual(course);
  });

  it("returns null for missing data", async () => {
    const result = await onboardingService.getStoredInviteCode();
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signup
// ---------------------------------------------------------------------------

describe("onboardingService.signup", () => {
  const validSignupData = {
    email: "stu@range.com",
    password: "ValidPass1",
    first_name: "Alice",
    last_name: "Smith",
    role: UserRole.STUDENT,
    company_id: 1,
    invite_code: "CODE123",
    instructor_id: null,
    course_id: 2,
  };

  it("returns success when API call succeeds", async () => {
    mockApiFetch.mockResolvedValueOnce({ user_id: 99, email: validSignupData.email });

    const result = await onboardingService.signup(validSignupData);

    expect(result.success).toBe(true);
  });

  it("returns 'already exists' error on 409", async () => {
    const { ApiError } = jest.requireMock("../../services/api");
    mockApiFetch.mockRejectedValueOnce(new ApiError(409, "Conflict"));

    const result = await onboardingService.signup(validSignupData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("returns validation failure for incomplete data", async () => {
    const result = await onboardingService.signup({
      ...validSignupData,
      email: "",
    });

    expect(result.success).toBe(false);
  });
});
