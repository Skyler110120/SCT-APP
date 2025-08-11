import { UserRole } from "../types/auth.types";
import {
    EnhancedSignupData,
    UserFormData,
    PartialUserFormData,
} from "../types/onboarding.types";

export function isStudent(role: UserRole): boolean {
    return role === UserRole.STUDENT;
}

export function needsInstructorAssignment(role: UserRole): boolean {
    return isStudent(role);
}

export function isValidEnhancedSignupData(
  data: Partial<EnhancedSignupData>
): data is EnhancedSignupData {
  const hasRequiredFields = !!(
    data.email &&
    data.password &&
    data.first_name &&
    data.last_name &&
    data.company_id &&
    data.role &&
    data.invite_code
  );

  if (!hasRequiredFields) {
    return false;
  }

  return true;
}

export function isValidUserFormData (
    data: PartialUserFormData
): data is UserFormData {
    return !!(
        data.email &&
        data.password &&
        data.first_name &&
        data.last_name
    );
}

export function passwordsMatch(data: PartialUserFormData): boolean {
    if (!data.confirm_password) {
        return true;
    }
    return data.password === data.confirm_password
}

export function getUserFormDataErrors(data: PartialUserFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters with a letter and number';
  }
  
  if (!data.first_name) {
    errors.first_name = 'First name is required';
  }
  
  if (!data.last_name) {
    errors.last_name = 'Last name is required';
  }
  
  if (data.confirm_password && !passwordsMatch(data)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}