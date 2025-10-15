export enum SleepQuality {
    POOR = "POOR",
    AVERAGE = "AVERAGE",
    GREAT = "GREAT"
}

export enum PreStressLevel {
    LOW = "LOW",
    MODERATE = "MODERATE",
    HIGH = "HIGH"
}

export enum PostStressLevel {
    LESS_STRESSED = "LESS_STRESSED",
    SAME = "SAME",
    MORE_STRESSED = "MORE_STRESSED"
}

export interface CreateSessionFormRequest {
    session_id: number;
}

export interface UpdateSessionFormRequest {
    sleep_hours?: number;
    sleep_quality?: SleepQuality;
    has_eaten?: boolean;
    has_pain?: boolean;
    pain_description?: string;
    pre_stress_level?: PreStressLevel;
    motivation_before?: number;
    
    post_stress_level?: PostStressLevel;
    motivation_after?: number;
    confidence_level?: number;
    highlight?: string;

    advance_student?: boolean;
    instructor_notes?: string;
}

export interface CompleteSessionFormRequest {
    sleep_hours?: number;
    sleep_quality?: SleepQuality;
    has_eaten?: boolean;
    has_pain?: boolean;
    pain_description?: string;
    pre_stress_level?: PreStressLevel;
    motivation_before?: number;

    post_stress_level: PostStressLevel;
    motivation_after?: number;
    confidence_level?: number;
    highlight?: string;

    advance_student?: boolean;
    instructor_notes?: string;
}

export interface SessionForm {
    id: number;
    session_id: number;
    instructor_id: number;
    student_id: number;
    course_id?: number;
    week_number: number;

    sleep_hourse?: number;
    sleep_quality?: SleepQuality;
    has_eaten?: boolean;
    has_pain?: boolean;
    pain_description?: string;
    pre_stress_level?: PreStressLevel;
    motivation_before?: number;

    post_stress_level?: PostStressLevel;
    motivation_after?: number;
    confidence_level?: number;
    highlight?: string;

    advance_student: boolean;
    instructor_notes?: string;

    is_completed: boolean;
    completed_at?: string;
    created_at: string;
}

export interface SessionFormResponse {
    success: boolean;
    data?: SessionForm;
    message?: string;
    error?: string;
}

export interface SessionFormListResponse {
    success: boolean;
    data?: SessionForm[];
    error?: string;
}

export interface SessionFormCompleteResponse {
    success: boolean;
    form_id?: number;
    student_advanced?: boolean;
    session_completed?: boolean;
    message?: string;
    error?: string;
}