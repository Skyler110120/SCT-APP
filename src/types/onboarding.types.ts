import { UserRole, ApiResponse } from "@/src/types/auth.types";

export enum OnboardingStep {
  INVITE_CODE = "invite_code",
  COMPANY_INFO = "company_info",
  ROLE_SELECTION = "role_selection",
  INSTRUCTOR_SELECTION = "instructor_selection",
  USER_DETAILS = "user_details",
  ACCOUNT_CREATION = "account_creation",
  COMPLETION = "completion",
}
export interface InviteCodeValidationRequest {
  code: string;
}

export interface CompanyInfo {
  company_id: number;
  company_name: string;
  is_first_user: boolean;
}

export type InviteCodeValidationResponse = ApiResponse<CompanyInfo>;

export interface UserFormData {
  email: string;
  password: string;
  confirm_password?: string;
  first_name: string;
  last_name: string;
}
export type PartialUserFormData = Partial<UserFormData>;

export interface UserFormDataWithRegistration extends UserFormData{
  companyInfo?: CompanyInfo;
  instructor_id?: number;
  course_id?: number;
}

export interface EnhancedSignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_id?: number;
  role?: UserRole;
  instructor_id?: number | null;
  course_id?: number | null;
  invite_code?: string;
}

export interface EnhancedSignupUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: number;
  instructor_id?: number | null;
  has_completed_onboarding: boolean;
  is_active: boolean;
}

export type EnhancedSignupResponse = ApiResponse<EnhancedSignupUser>;

export interface InstructorOption {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  course_count?: number;
}

export type InstructorsResponse = ApiResponse<InstructorOption[]>;

export interface CourseOption {
  id: number;
  course_name: string;
  instructor_id: number;
  description?: string;
  is_active?: boolean;
}

export type CourseResponse = ApiResponse<CourseOption[]>;

export interface OnboardingState {
  currentStep: OnboardingStep;
  isLoading: boolean;
  error: string | null;
  inviteCode?: string;
  companyInfo?: CompanyInfo;
  selectedRole?: UserRole;
  selectedInstructor?: InstructorOption;
  availabileInstructors?: InstructorOption[];
  userFormData?: UserFormData;
}

export type OnboardingAction =
  | { type: "SET_STEP"; payload: OnboardingStep }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INVITE_CODE"; payload: string }
  | { type: "SET_COMPANY_INFO"; payload: CompanyInfo }
  | { type: "SET_SELECTED_ROLE"; payload: UserRole }
  | { type: "SET_SELECTED_INSTRUCTOR"; payload: InstructorOption }
  | { type: "SET_AVAILABLE_INSTRUCTORS"; payload: InstructorOption[] }
  | { type: "SET_USER_FORM_DATA"; payload: Partial<UserFormData> } // ✅ CLEAN: Uses extracted type
  | { type: "SET_FIELD_ERROR"; payload: { field: string; error: string } }
  | { type: "CLEAR_FIELD_ERROR"; payload: string }
  | { type: "RESET_ONBOARDING" };
