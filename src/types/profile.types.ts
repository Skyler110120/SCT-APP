export interface ProfileBase {
    bio?: string;
    profile_picture?: string;
    phone_number?: string;
    date_of_birth?: string;
    course_id?: number;
}

export interface Profile extends ProfileBase {
    id: number;
    user_id: number;
}

export interface UserOut {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface CourseOut {
  id: number;
  title: string;
  description?: string;
}

export interface ProfileDetailed extends ProfileBase {
  id: number;
  user_id: number;
  user: UserOut;
  course?: CourseOut;
}

export interface ProfileCreateRequest extends ProfileBase {
    email?: string;
}

export interface ProfileUpdateRequest extends ProfileBase {
    email?: string;
}

export interface ProfileResponse {
    success: boolean;
    data?: ProfileDetailed;
    message?: string;
    error?: string;
}

export interface ProfileListResponse {
    success: boolean;
    data?: ProfileDetailed[];
    error?: string;
}

export interface InstructorListRequest {
    skip?: number;
    limit?: number;
}