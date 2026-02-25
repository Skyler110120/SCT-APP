/**
 * Tests for onboarding validation utilities.
 */
import {
  isValidEnhancedSignupData,
  isValidUserFormData,
  passwordsMatch,
  getUserFormDataErrors,
  isValidEmail,
  isValidPassword,
  needsInstructorAssignment,
} from "../../utils/onboardingValidationUtils";
import { UserRole } from "../../types/auth.types";

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@tld")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidPassword
// ---------------------------------------------------------------------------

describe("isValidPassword", () => {
  it("accepts passwords with 8+ chars, a letter, and a number", () => {
    expect(isValidPassword("Pass1234")).toBe(true);
    expect(isValidPassword("abcde12345")).toBe(true);
  });

  it("rejects passwords that are too short", () => {
    expect(isValidPassword("Ab1")).toBe(false);
  });

  it("rejects passwords with no numbers", () => {
    expect(isValidPassword("PasswordOnly")).toBe(false);
  });

  it("rejects passwords with no letters", () => {
    expect(isValidPassword("12345678")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// passwordsMatch
// ---------------------------------------------------------------------------

describe("passwordsMatch", () => {
  it("returns true when passwords match", () => {
    expect(passwordsMatch({ password: "Pass1234", confirm_password: "Pass1234" })).toBe(true);
  });

  it("returns false when passwords differ", () => {
    expect(passwordsMatch({ password: "Pass1234", confirm_password: "Other456" })).toBe(false);
  });

  it("returns true when confirm_password is absent (not yet filled)", () => {
    expect(passwordsMatch({ password: "Pass1234" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getUserFormDataErrors
// ---------------------------------------------------------------------------

describe("getUserFormDataErrors", () => {
  const valid = {
    email: "user@example.com",
    password: "ValidPass1",
    first_name: "Alice",
    last_name: "Smith",
  };

  it("returns no errors for valid data", () => {
    expect(getUserFormDataErrors(valid)).toEqual({});
  });

  it("reports missing email", () => {
    const errors = getUserFormDataErrors({ ...valid, email: "" });
    expect(errors).toHaveProperty("email");
  });

  it("reports invalid email format", () => {
    const errors = getUserFormDataErrors({ ...valid, email: "not-valid" });
    expect(errors).toHaveProperty("email");
  });

  it("reports missing first_name", () => {
    const errors = getUserFormDataErrors({ ...valid, first_name: "" });
    expect(errors).toHaveProperty("first_name");
  });

  it("reports missing last_name", () => {
    const errors = getUserFormDataErrors({ ...valid, last_name: "" });
    expect(errors).toHaveProperty("last_name");
  });

  it("reports weak password", () => {
    const errors = getUserFormDataErrors({ ...valid, password: "weak" });
    expect(errors).toHaveProperty("password");
  });

  it("reports mismatched confirm_password", () => {
    const errors = getUserFormDataErrors({ ...valid, confirm_password: "Different1" });
    expect(errors).toHaveProperty("confirmPassword");
  });
});

// ---------------------------------------------------------------------------
// isValidEnhancedSignupData
// ---------------------------------------------------------------------------

describe("isValidEnhancedSignupData", () => {
  const valid = {
    email: "user@example.com",
    password: "ValidPass1",
    first_name: "Alice",
    last_name: "Smith",
    company_id: 1,
    role: UserRole.STUDENT,
    invite_code: "CODE123",
    instructor_id: null,
    course_id: 2,
  };

  it("returns true for complete signup data", () => {
    expect(isValidEnhancedSignupData(valid)).toBe(true);
  });

  it("returns true even when instructor_id is null (students no longer require instructor)", () => {
    expect(isValidEnhancedSignupData({ ...valid, instructor_id: null })).toBe(true);
  });

  it("returns false when email is missing", () => {
    expect(isValidEnhancedSignupData({ ...valid, email: "" })).toBe(false);
  });

  it("returns false when company_id is missing", () => {
    const { company_id, ...rest } = valid;
    expect(isValidEnhancedSignupData(rest)).toBe(false);
  });

  it("returns false when invite_code is missing", () => {
    expect(isValidEnhancedSignupData({ ...valid, invite_code: "" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// needsInstructorAssignment (now always false — kept for backward compat)
// ---------------------------------------------------------------------------

describe("needsInstructorAssignment", () => {
  it("returns true for STUDENT role (legacy — field kept but not enforced at signup)", () => {
    // The function still returns true for students but onboarding no longer blocks on it
    expect(needsInstructorAssignment(UserRole.STUDENT)).toBe(true);
  });

  it("returns false for INSTRUCTOR role", () => {
    expect(needsInstructorAssignment(UserRole.INSTRUCTOR)).toBe(false);
  });
});
