import { OnboardingStep, OnboardingState, CompanyInfo } from "@/src/types/onboarding.types";
import { UserRole } from "@/src/types/auth.types";
import { needsInstructorAssignment } from "./onboardingValidationUtils";

export function getNextOnboardingStep(
  currentStep: OnboardingStep,
  state: Partial<OnboardingState>
): OnboardingStep | null {
    if (currentStep === OnboardingStep.INVITE_CODE){
        return OnboardingStep.COMPANY_INFO;
    } else if (currentStep === OnboardingStep.COMPANY_INFO) {
        if (state.companyInfo?.is_first_user) {
            return OnboardingStep.USER_DETAILS;
        }
        return OnboardingStep.ROLE_SELECTION;
    }
    else if (currentStep === OnboardingStep.ROLE_SELECTION) {
        if (needsInstructorAssignment(state.selectedRole!)) {
            return OnboardingStep.INSTRUCTOR_SELECTION;
        }
        return OnboardingStep.USER_DETAILS;
    } else if (currentStep === OnboardingStep.INSTRUCTOR_SELECTION) {
        return OnboardingStep.USER_DETAILS;
    } else if (currentStep === OnboardingStep.USER_DETAILS) {
        return OnboardingStep.ACCOUNT_CREATION;
    } else if (currentStep === OnboardingStep.ACCOUNT_CREATION) {
        return OnboardingStep.COMPLETION;
    } else if (currentStep === OnboardingStep.COMPLETION) {
        return null;
    } else {
        return null;
    }
}

export function canSkipRoleSelection(companyInfo: CompanyInfo): boolean {
  return companyInfo.is_first_user;
}

export function getDefaultRoleForFirstUser(): UserRole {
  return UserRole.ADMIN;
}