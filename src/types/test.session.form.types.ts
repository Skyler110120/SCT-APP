import { SleepQuality, PreStressLevel, PostStressLevel } from "./enums";

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
  final_passed?: boolean;
  pass_override_reason?: string;
  instructor_notes?: string;
  drill_updates?: Array<{
    drill_id: number;
    current_value?: number;
    time_seconds?: number;
    hit_count?: number;
    passed?: boolean;
  }>;
}

export interface CompleteTestSessionFormRequest {
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
  final_passed?: boolean;
  pass_override_reason?: string;
  instructor_notes?: string;
  drill_updates?: Array<{
    drill_id: number;
    current_value?: number;
    time_seconds?: number;
    hit_count?: number;
    passed?: boolean;
  }>;
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
  advance_student: boolean;
  auto_passed?: boolean | null;
  final_passed?: boolean | null;
  pass_override_applied?: boolean;
  pass_override_reason?: string | null;
  instructor_notes?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  available_drills?: unknown;
  drill_results?: Array<{
    drill_id: number;
    current_value?: number | null;
    time_seconds?: number | null;
    hit_count?: number | null;
    auto_passed?: boolean | null;
    passed?: boolean | null;
    pass_override_applied?: boolean;
  }>;
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