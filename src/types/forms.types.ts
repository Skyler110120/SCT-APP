import { SleepQuality, PreStressLevel, PostStressLevel } from "./enums";

export interface CreateSessionFormRequest {
    session_id: number;
    student_id?: number;
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

    advance_student: boolean;
    auto_passed?: boolean | null;
    final_passed?: boolean | null;
    pass_override_applied?: boolean;
    pass_override_reason?: string | null;
    instructor_notes?: string;

    is_completed: boolean;
    completed_at?: string;
    is_pretraining_completed?: boolean;
    pretraining_completed_at?: string;
    is_posttraining_completed?: boolean;
    posttraining_completed_at?: string;
    is_session_submitted?: boolean;
    session_submitted_at?: string;
    ended_early?: boolean;
    ended_early_at?: string;
    created_at: string;
    updated_at?: string;
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

export type SessionWorkflowStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type SessionWorkflowPhase =
  | "PRE_TRAINING"
  | "DRILLS"
  | "POST_TRAINING"
  | "COMPLETED";

export type SessionMode = "REGULAR" | "TEST" | "RETRAIN_FREE" | "ADVANCED";

export interface SessionParticipantDrillProgress {
  id: number;
  drill_id: number;
  class_drill_id?: number | null;
  display_order: number;
  is_completed: boolean;
  completed_at?: string | null;
  last_toggled_at?: string | null;
  name: string;
  purpose?: string | null;
  target_spec?: string | null;
  target_count?: number | null;
  rounds_total?: number | null;
  rounds_per_string?: number | null;
  number_of_strings?: number | null;
  loadout?: string | null;
  instructor_notes?: string | null;
  time_seconds?: number | null;
  hit_count?: number | null;
  auto_passed?: boolean | null;
  passed?: boolean | null;
  pass_override_applied?: boolean;
  videos: {
    id: number;
    title?: string | null;
    video_filename?: string | null;
  }[];
}

export interface SessionParticipantWorkflow {
  session_participant_id: number;
  student_id: number;
  student_name: string;
  student_profile_picture?: string | null;
  student_email?: string | null;
  booked_course_id?: number | null;
  booked_course_title?: string | null;
  booked_week_number?: number | null;
  is_test_session_required?: boolean;
  session_mode?: SessionMode;
  pretraining_status: SessionWorkflowStatus;
  posttraining_status: SessionWorkflowStatus;
  current_phase: SessionWorkflowPhase;
  ended_early: boolean;
  is_session_submitted: boolean;
  pretraining_completed_at?: string | null;
  drills_completed_at?: string | null;
  posttraining_completed_at?: string | null;
  session_submitted_at?: string | null;
  form?: SessionForm | null;
  drills: SessionParticipantDrillProgress[];
}

export interface SessionWorkflow {
  session_id: number;
  session_status: string;
  participants: SessionParticipantWorkflow[];
}

export interface SessionWorkflowResponse {
  success: boolean;
  data?: SessionWorkflow;
  error?: string;
}