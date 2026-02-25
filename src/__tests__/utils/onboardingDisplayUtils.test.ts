/**
 * Tests for onboarding display utility functions.
 * Pure functions — no mocks needed.
 */
import {
  getStepTitle,
  getStepProgress,
  formatInstructorName,
} from "../../utils/onboardingDisplayUtils";
import { OnboardingStep, InstructorOption } from "../../types/onboarding.types";

// ---------------------------------------------------------------------------
// getStepTitle
// ---------------------------------------------------------------------------

describe("getStepTitle", () => {
  it("returns 'Enter Invite Code' for INVITE_CODE", () => {
    expect(getStepTitle(OnboardingStep.INVITE_CODE)).toBe("Enter Invite Code");
  });

  it("returns 'Company Information' for COMPANY_INFO", () => {
    expect(getStepTitle(OnboardingStep.COMPANY_INFO)).toBe("Company Information");
  });

  it("returns 'Select Your Role' for ROLE_SELECTION", () => {
    expect(getStepTitle(OnboardingStep.ROLE_SELECTION)).toBe("Select Your Role");
  });

  it("returns 'Choose Your Instructor' for INSTRUCTOR_SELECTION", () => {
    expect(getStepTitle(OnboardingStep.INSTRUCTOR_SELECTION)).toBe("Choose Your Instructor");
  });

  it("returns 'Your Information' for USER_DETAILS", () => {
    expect(getStepTitle(OnboardingStep.USER_DETAILS)).toBe("Your Information");
  });

  it("returns 'Creating Account' for ACCOUNT_CREATION", () => {
    expect(getStepTitle(OnboardingStep.ACCOUNT_CREATION)).toBe("Creating Account");
  });

  it("returns 'Welcome!' for COMPLETION", () => {
    expect(getStepTitle(OnboardingStep.COMPLETION)).toBe("Welcome!");
  });

  it("returns 'Setup' for unrecognized step", () => {
    expect(getStepTitle("unknown" as OnboardingStep)).toBe("Setup");
  });
});

// ---------------------------------------------------------------------------
// getStepProgress
// ---------------------------------------------------------------------------

describe("getStepProgress", () => {
  it("returns a number between 0 and 100", () => {
    const steps = Object.values(OnboardingStep);
    steps.forEach((step) => {
      const progress = getStepProgress(step);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  it("returns 100 for the last step (COMPLETION)", () => {
    expect(getStepProgress(OnboardingStep.COMPLETION)).toBe(100);
  });

  it("returns increasing progress for sequential steps", () => {
    const inviteProgress = getStepProgress(OnboardingStep.INVITE_CODE);
    const companyProgress = getStepProgress(OnboardingStep.COMPANY_INFO);
    const completionProgress = getStepProgress(OnboardingStep.COMPLETION);

    expect(companyProgress).toBeGreaterThan(inviteProgress);
    expect(completionProgress).toBeGreaterThan(companyProgress);
  });
});

// ---------------------------------------------------------------------------
// formatInstructorName
// ---------------------------------------------------------------------------

describe("formatInstructorName", () => {
  it("formats first and last name with space", () => {
    const instructor: InstructorOption = {
      id: 1,
      email: "instructor@test.com",
      first_name: "John",
      last_name: "Doe",
    };
    expect(formatInstructorName(instructor)).toBe("John Doe");
  });

  it("handles single-character names", () => {
    const instructor: InstructorOption = {
      id: 2,
      email: "j@test.com",
      first_name: "J",
      last_name: "D",
    };
    expect(formatInstructorName(instructor)).toBe("J D");
  });
});
