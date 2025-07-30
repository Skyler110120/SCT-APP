import { OnboardingStep, InstructorOption } from "@/src/types/onboarding.types";

export function getStepTitle(step: OnboardingStep): string {
  if (step === OnboardingStep.INVITE_CODE ){
    return 'Enter Invite Code';
  } else if (step === OnboardingStep.COMPANY_INFO) {
    return 'Company Information';
  } else if (step === OnboardingStep.ROLE_SELECTION) {
    return 'Select Your Role';
  } else if (step === OnboardingStep.INSTRUCTOR_SELECTION) {
    return 'Choose Your Instructor';
  } else if (step === OnboardingStep.USER_DETAILS) {
    return 'Your Information';
  } else if (step === OnboardingStep.ACCOUNT_CREATION) {
    return 'Creating Account';
  } else if (step === OnboardingStep.COMPLETION) {
    return 'Welcome!';
  } else {
    return 'Setup';
  }
}

export function getStepProgress(step: OnboardingStep): number {
  const steps = Object.values(OnboardingStep);
  const currentIndex = steps.indexOf(step);
  return Math.round(((currentIndex + 1) / steps.length) * 100);
}

export function formatInstructorName(instructor: InstructorOption): string {
  return `${instructor.first_name} ${instructor.last_name}`;
}