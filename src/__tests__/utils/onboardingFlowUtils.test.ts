/**
 * Tests for onboarding flow utility functions.
 * Pure functions — no mocks needed.
 */
import {
  getNextOnboardingStep,
  canSkipRoleSelection,
  getDefaultRoleForFirstUser,
} from "../../utils/onboardingFlowUtils";
import { OnboardingStep, CompanyInfo } from "../../types/onboarding.types";
import { UserRole } from "../../types/auth.types";

// ---------------------------------------------------------------------------
// getNextOnboardingStep
// ---------------------------------------------------------------------------

describe("getNextOnboardingStep", () => {
  it("goes from INVITE_CODE to COMPANY_INFO", () => {
    const result = getNextOnboardingStep(OnboardingStep.INVITE_CODE, {});
    expect(result).toBe(OnboardingStep.COMPANY_INFO);
  });

  it("goes from COMPANY_INFO to USER_DETAILS when is_first_user", () => {
    const result = getNextOnboardingStep(OnboardingStep.COMPANY_INFO, {
      companyInfo: { company_id: 1, company_name: "Range", is_first_user: true } as any,
    });
    expect(result).toBe(OnboardingStep.USER_DETAILS);
  });

  it("goes from COMPANY_INFO to ROLE_SELECTION when not first user", () => {
    const result = getNextOnboardingStep(OnboardingStep.COMPANY_INFO, {
      companyInfo: { company_id: 1, company_name: "Range", is_first_user: false } as any,
    });
    expect(result).toBe(OnboardingStep.ROLE_SELECTION);
  });

  it("goes from ROLE_SELECTION to INSTRUCTOR_SELECTION for students", () => {
    const result = getNextOnboardingStep(OnboardingStep.ROLE_SELECTION, {
      selectedRole: UserRole.STUDENT,
    });
    expect(result).toBe(OnboardingStep.INSTRUCTOR_SELECTION);
  });

  it("goes from ROLE_SELECTION to USER_DETAILS for non-students", () => {
    const result = getNextOnboardingStep(OnboardingStep.ROLE_SELECTION, {
      selectedRole: UserRole.ADMIN,
    });
    expect(result).toBe(OnboardingStep.USER_DETAILS);
  });

  it("goes from INSTRUCTOR_SELECTION to USER_DETAILS", () => {
    const result = getNextOnboardingStep(OnboardingStep.INSTRUCTOR_SELECTION, {});
    expect(result).toBe(OnboardingStep.USER_DETAILS);
  });

  it("goes from USER_DETAILS to ACCOUNT_CREATION", () => {
    const result = getNextOnboardingStep(OnboardingStep.USER_DETAILS, {});
    expect(result).toBe(OnboardingStep.ACCOUNT_CREATION);
  });

  it("goes from ACCOUNT_CREATION to COMPLETION", () => {
    const result = getNextOnboardingStep(OnboardingStep.ACCOUNT_CREATION, {});
    expect(result).toBe(OnboardingStep.COMPLETION);
  });

  it("returns null from COMPLETION (final step)", () => {
    const result = getNextOnboardingStep(OnboardingStep.COMPLETION, {});
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// canSkipRoleSelection
// ---------------------------------------------------------------------------

describe("canSkipRoleSelection", () => {
  it("returns true when user is the first user in company", () => {
    const companyInfo: CompanyInfo = {
      company_id: 1,
      company_name: "Test Range",
      is_first_user: true,
    } as any;
    expect(canSkipRoleSelection(companyInfo)).toBe(true);
  });

  it("returns false when user is not the first user", () => {
    const companyInfo: CompanyInfo = {
      company_id: 1,
      company_name: "Test Range",
      is_first_user: false,
    } as any;
    expect(canSkipRoleSelection(companyInfo)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDefaultRoleForFirstUser
// ---------------------------------------------------------------------------

describe("getDefaultRoleForFirstUser", () => {
  it("returns ADMIN role", () => {
    expect(getDefaultRoleForFirstUser()).toBe(UserRole.ADMIN);
  });
});
