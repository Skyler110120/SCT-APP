import { CourseStudentView } from './course.types';
import { EnrollmentStatus } from './enums';

export enum ProgressionDecision {
    APPROVED = 'approved',
    NEEDS_MORE = 'needs_more'
}

export interface StudentEnrollment {
    id: number;
    course_id: number;
    student_id: number;
    status: EnrollmentStatus;
    current_week: number;
    progression_percentage: number;
    current_month: number;
    current_week_in_month: number;
    week_display: string;
    instructor_decision?: ProgressionDecision;
    instructor_notes?: string;
    enrolled_at: string;
    completed_at?: string;
}

export interface EnrollmentWithCourse extends StudentEnrollment {
    course: CourseStudentView;
}

export interface StudentWeeklyProgress {
    enrollment_id: number;
    student_name: string;
    course_title: string;
    current_week: number;
    week_display: string;
    progress_percentage: number;
    instructor_decision?: ProgressionDecision;
    instructor_notes?: string;
    days_since_enrollment: number;
}

export interface StudentStats {
    type: 'student';
    courseTitle: string;
    totalWeeks: number;
    videosAvailable: number;
    currentWeek: number;
    progressPercentage: number;
}

export interface InstructorStats {
    type: 'instructor';
    totalCourses: number;
    totalStudents: number;
    studentsInProgress: number;
}

export type Stats = StudentStats | InstructorStats;

export interface EnrollmentCreateRequest {
    course_id: number;
}

export interface WeeklyProgressUpdateRequest {
    student_id: number;
    decision: ProgressionDecision;
    notes?: string;
}

export interface EnrollmentResponse {
    success: boolean;
    data?: EnrollmentWithCourse;
    error?: string;
}

export interface EnrollmentWithCourseResponse {
    success: boolean;
    data?: EnrollmentWithCourse;
    error?: string;
}

export interface StudentProgressListResponse {
    success: boolean;
    data?: StudentWeeklyProgress[];
    error?: string;
}