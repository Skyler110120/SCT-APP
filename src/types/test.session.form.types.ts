import { SleepQuality, PreStressLevel, PostStressLevel } from './enums';

import { StudentDrillResultUpdate, StudentDrillSummary } from './course.drills.types';

export interface CreateTestSessionFormRequest {
    session_id: number;
}

export interface UpdateTestSessionFormRequest {
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

    drill_updated?: StudentDrillResultUpdate[];
}

export interface CompleteTestSessionFormRequest {
    sleep_hours?: number;
    sleep_quality?: SleepQuality;
    has_eaten?: boolean;
    has_pain?: boolean;
    pain_descripiton?: string;
    pre_stress_level?: PreStressLevel;
    motivation_before?: number;

    post_stress_level?: PostStressLevel;
    motivation_after?: number;
    confidence_level?: number;
    highlight?: string;

    advance_student?: boolean;
    instructor_notes?: string;

    drill_updates?: StudentDrillResultUpdate[];
}

export interface TestSessionForm {
    id: number;
    session_id: number;
    instructor_id: number;
    student_id: number;
    course_id?: number;
    week_number: number;

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

    is_completed: boolean;
    created_at: string;
    updated_at: string;

    available_drills?: StudentDrillSummary;
}

export interface TestSessionFormResponse {
    success: boolean;
    data?: TestSessionForm;
    message?: string;
    error?: string;
}

export interface TestSessionFormListResponse {
    success: boolean;
    data?: TestSessionForm[];
    error?: string;
}

export interface TestSessionFormCompleteResponse {
    success: boolean;
    form_id?: number;
    student_advanced?: boolean;
    session_completed?: boolean;
    student_id?: number;
    course_id?: number;
    week_completed?: number;
    message?: string;
    error?: string;
}