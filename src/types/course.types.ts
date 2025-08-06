export enum CourseDifficulty {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced'
}

export enum GunType {
    HANDGUN = 'Handgun',
    RIFLE = 'Rifle',
    SHOTGUN = 'Shotgun',
    CARBINE = 'Carbine',
    Recolver = 'Revolver'
}

export interface CourseVideo {
    id: number;
    title: string;
    description?: string;
    video_url: string;
    order_index: number;
    week_number?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CourseSummary {
    id: number;
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    order_index: number;
}

export interface CourseStudentView {
    id: number;
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_url?: string;
    total_weeks: number;
    videos: CourseVideo[];
}

export interface CourseInstructorView {
    id: number;
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_url?: string;
    instructor_script_url?: string;
    total_weeks: number;
    videos: CourseVideo[];
}

export interface CourseAdminView {
    id: number;
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string
    pdf_url?: string;
    instructor_script_url?: string;
    total_weeks: number;
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
    videos: CourseVideo[];
}

export interface CourseCreateRequest {
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_url?: string;
    instructor_script_url?: string;
    order_index: number;
}

export interface CourseUpdateRequest {
    title?: string;
    description?: string;
    required_gun_type?: string;
    difficulty_level?: string;
    pdf_url?: string;
    instructor_script_url?: string;
    is_active?: boolean;
    order_index?: number;
}

export interface VideoCreateRequest {
    title: string;
    description?: string;
    video_url: string;
    order_index: number;
    week_number?: number;
}

export interface VideoUpdateRequest {
    title?: string;
    description?: string;
    video_url?: string;
    order_index?: number;
    week_number?: number;
}

export interface CourseResponse {
    success: boolean;
    data?: CourseAdminView;
    message?: string;
    error?: string;
}

export interface CourseListResponse {
    success: boolean;
    data?: CourseSummary[];
    error?: string;
}

export interface CourseStudentResponse {
    success: boolean;
    data?: CourseStudentView;
    error?: string;
}

export interface CourseInstructorListResponse {
    success: boolean;
    data?: CourseInstructorView[];
    error?: string;
}

export interface CourseAdminListResponse {
    success: boolean;
    data?: CourseAdminView[];
    error?: string;
}

export interface VideoResponse {
    success: boolean;
    data?: CourseVideo;
    message?: string;
    error?: string;
}

