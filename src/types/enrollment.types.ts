import { CourseStudentView } from './course.types';
import { EnrollmentStatus } from './enums';

export enum ProgressionDecision {
    APPROVED = 'approved',
    NEEDS_MORE = 'needs_more'
}

/** Max allowed missed weeks before grace/makeup rules apply. */
export const MAX_MISSED_WEEKS_ALLOWED = 4;

/** Live sessions included in the grace month at no charge. */
export const GRACE_MONTH_MAKEUP_SESSIONS = MAX_MISSED_WEEKS_ALLOWED;

export type ProgramCadence = 'WEEKLY' | 'BIWEEKLY';

export enum EnrollmentPhase {
    NORMAL = 'NORMAL',
    MAKEUP_FREE = 'MAKEUP_FREE',
    MAKEUP_PAID = 'MAKEUP_PAID',
    POST_SUBSCRIPTION = 'POST_SUBSCRIPTION',
}

export interface StudentEnrollment {
    id: number;
    course_id: number;
    student_id: number;
    status: EnrollmentStatus;
    current_week: number;
    progress_percentage: number;
    current_month: number;
    current_week_in_month: number;
    week_display: string;
    instructor_decision?: ProgressionDecision;
    enrolled_at: string;
    completed_at?: string;

    // Payment / phase fields
    subscription_id?: number | null;
    payment_required: boolean;
    enrollment_phase: EnrollmentPhase;
    completed_sessions_count: number;
    make_up_sessions_remaining: number;

    // Program policy / progression fields computed by the API
    weeks_missed?: number;
    program_cadence?: ProgramCadence;
    billing_months?: number;
    monthly_price_cents?: number;
    grace_months?: number;
    makeup_limit?: number;
    overage_price_cents?: number;
    cadence_anchor_date?: string | null;
    covered_program_months?: number;
    unlocked_program_month?: number;
}

export interface EnrollmentWithCourse extends StudentEnrollment {
    course: CourseStudentView;
    next_week_to_book?: number;
}

export interface StudentWeeklyProgress {
    enrollment_id: number;
    student_name: string;
    course_title: string;
    current_week: number;
    week_display: string;
    progress_percentage: number;
    instructor_decision?: ProgressionDecision;
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
    enrollment_id?: number;
    student_id?: number;
    course_id?: number;
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