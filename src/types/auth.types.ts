import { UserRole } from "./enums";

export interface InstructorPermissionSet {
  can_manage_own_availability?: boolean;
  can_manage_own_time_off?: boolean;
  can_manage_others_availability?: boolean;
  can_manage_others_permissions?: boolean;
  can_create_student_invite_codes?: boolean;
  can_create_instructor_invite_codes?: boolean;
  can_set_own_session_capacity?: boolean;
  can_set_others_session_capacity?: boolean;
  max_students_per_session_self?: number;
  max_students_per_session_others?: number;
}

export interface User extends InstructorPermissionSet {
  company_id: number | null;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  instructor_id?: number | null;
  has_completed_onboarding: boolean;
  is_active: boolean;
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  birthday?: string;
  bio?: string;
  company_name?: string;
  instructor_name?: string;
  profile_picture?: string;
}

export interface UserInfo extends InstructorPermissionSet {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: number | null;
  instructor_id?: number | null;
  has_completed_onboarding: boolean;
  is_active: boolean;
  is_approved: boolean;
  phone?: string;
  birthday?: string;
  bio?: string;
  company_name?: string;
  instructor_name?: string;
  profile_picture?: string;
}

export interface UserUpdate {
  company_id?: number | null;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  instructor_id?: number | null;
  has_completed_onboarding?: boolean;
  email?: string;
  is_active?: boolean;
  phone?: string;
  birthday?: string;
  bio?: string;
  profile_picture?: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  company_id?: number;
  instructor_id?: number;
}

export interface InviteCodeValidation {
  code: string;
}

export interface InviteCodeInfo {
  company_id: number;
  company_name: string;
  is_first_user: boolean;
}

export interface CreateCompanyRequest {
  name: string;
  slug?: string;
  website?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: number | null;
  instructor_id?: number | null;
  profile_picture?: string;
  needs_onboarding: boolean;
  has_completed_onboarding: boolean;
  is_approved: boolean;
  can_manage_own_availability: boolean;
  can_manage_own_time_off: boolean;
  can_manage_others_availability: boolean;
  can_manage_others_permissions: boolean;
  can_create_student_invite_codes: boolean;
  can_create_instructor_invite_codes: boolean;
  can_set_own_session_capacity: boolean;
  can_set_others_session_capacity: boolean;
  max_students_per_session_self: number;
  max_students_per_session_others: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type AuthResponse = ApiResponse<User>;
export type UserResponse = ApiResponse<User>;
export type UserListResponse = ApiResponse<User[]>;

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthState {
  is_loading: boolean;
  is_authenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  needs_onboarding: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: TokenResponse;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  invite_code: string;
  role?: UserRole;
  company_id?: number;
  instructor_id?: number | null;
}

export interface StudentInstructorAssignment {
  student_id: number;
  instructor_id: number;
}

export interface InstructorPermissionUpdate extends InstructorPermissionSet {}

export interface UserWithInstructor extends UserInfo {
  instructor?: User;
}

export interface UserWithStudents extends UserInfo {
  students: User[];
}

export type UserWithInstructorResponse = ApiResponse<UserWithInstructor>;
export type UserWithStudentsResponse = ApiResponse<UserWithStudents>;

export interface UserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface UserDisplayInfo {
  full_name: string;
  display_name: string;
  initials: string;
}

export interface InstructorStudentsResponse {
  success: boolean;
  data?: User[];
  error?: string;
}

export { UserRole };
