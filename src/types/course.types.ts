import { MaterialInfoResponse } from './material.types';

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
    REVOLVER = 'Revolver'
}

export interface CourseVideo {
    id: number;
    title: string;
    description?: string;
    video_url?: string | null;
    video_s3_key?: string | null;
    video_filename?: string | null;
    video_content_type?: string | null;
    order_index: number;
    week_number?: number;
    /** When true, students can see this video. Default false (instructor-only). */
    is_public?: boolean;
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

export type CourseView = CourseStudentView | CourseInstructorView;

export interface CourseStudentView {
    id: number;
    title: string;
    viewType: 'student';
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_s3_key?: string | null;
    /** When true, students can see the course PDF. */
    pdf_is_public?: boolean;
    instructor_script_s3_key?: string | null;
    total_weeks: number;
    videos: CourseVideo[];
    material_info?: MaterialInfoResponse;
}

export interface CourseInstructorView {
    id: number;
    title: string;
    viewType: 'instructor';
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_s3_key?: string | null;
    pdf_is_public?: boolean;
    instructor_script_s3_key?: string | null;
    total_weeks: number;
    videos: CourseVideo[];
    material_info?: MaterialInfoResponse;
}

export interface CourseAdminView {
    id: number;
    title: string;
    viewType: 'admin';
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_s3_key?: string | null;
    pdf_is_public?: boolean;
    instructor_script_s3_key?: string | null;
    pdf_filename?: string | null;
    instructor_script_filename?: string | null;
    pdf_content_type?: string | null;
    instructor_script_content_type?: string | null;
    total_weeks: number;
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
    videos: CourseVideo[];
    material_info?: MaterialInfoResponse;
}

export interface CourseCreateRequest {
    title: string;
    description?: string;
    required_gun_type: string;
    difficulty_level: string;
    pdf_s3_key?: string;
    instructor_script_s3_key?: string;
    pdf_filename?: string;
    instructor_script_filename?: string;
    pdf_content_type?: string;
    instructor_script_content_type?: string;
    /** When true, students can see the course PDF. Default false. */
    pdf_is_public?: boolean;
    order_index: number;
}

export interface CourseUpdateRequest {
    title?: string;
    description?: string;
    required_gun_type?: string;
    difficulty_level?: string;
    pdf_s3_key?: string;
    instructor_script_s3_key?: string;
    pdf_filename?: string;
    instructor_script_filename?: string;
    pdf_content_type?: string;
    instructor_script_content_type?: string;
    pdf_is_public?: boolean;
    is_active?: boolean;
    order_index?: number;
}

export interface VideoCreateRequest {
    title: string;
    description?: string;
    video_url?: string;
    video_s3_key?: string;
    video_filename?: string;
    video_content_type?: string;
    order_index: number;
    week_number?: number;
    /** When true, students can see this video. Default false (instructor-only). */
    is_public?: boolean;
}

export interface VideoUpdateRequest {
    title?: string;
    description?: string;
    video_url?: string | null;
    video_s3_key?: string | null;
    video_filename?: string | null;
    video_content_type?: string | null;
    order_index?: number;
    week_number?: number;
    is_public?: boolean;
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

