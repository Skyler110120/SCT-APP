// New drill types aligned with the native course structure refactor.
// Drills are platform-level (no course_id). They are assigned to classes via ClassDrill.

export enum FireType {
  DRY_FIRE = "DRY_FIRE",
  LIVE_FIRE = "LIVE_FIRE",
}

// ── Technical Fundamentals ─────────────────────────────────────────────

export interface TechnicalFundamental {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TechnicalFundamentalCreate {
  name: string;
  description?: string;
  display_order?: number;
}

export interface TechnicalFundamentalUpdate {
  name?: string;
  description?: string;
  display_order?: number;
}

// ── Drills (platform-level) ────────────────────────────────────────────

export interface TechnicalFundamentalBrief {
  id: number;
  name: string;
}

export interface Drill {
  id: number;
  name: string;
  purpose: string;
  fire_type: FireType;
  distance_yards?: number;
  target_spec?: string;
  target_count?: number;
  rounds_total?: number;
  rounds_per_string?: number;
  number_of_strings?: number;
  loadout?: string;
  position_start?: string;
  position_end?: string;
  commands: string;
  instructor_notes?: string;
  is_cte: boolean;
  time_limit_seconds?: number;
  passing_standard?: string;
  display_order: number;
  is_active: boolean;
  fundamentals: TechnicalFundamentalBrief[];
  created_at: string;
  updated_at: string;
}

export interface DrillCreate {
  name: string;
  purpose: string;
  fire_type: FireType;
  distance_yards?: number;
  target_spec?: string;
  target_count?: number;
  rounds_total?: number;
  rounds_per_string?: number;
  number_of_strings?: number;
  loadout?: string;
  position_start?: string;
  position_end?: string;
  commands: string;
  instructor_notes?: string;
  is_cte?: boolean;
  time_limit_seconds?: number;
  passing_standard?: string;
  display_order?: number;
  fundamental_ids?: number[];
}

export interface DrillUpdate {
  name?: string;
  purpose?: string;
  fire_type?: FireType;
  distance_yards?: number;
  target_spec?: string;
  target_count?: number;
  rounds_total?: number;
  rounds_per_string?: number;
  number_of_strings?: number;
  loadout?: string;
  position_start?: string;
  position_end?: string;
  commands?: string;
  instructor_notes?: string;
  is_cte?: boolean;
  time_limit_seconds?: number;
  passing_standard?: string;
  display_order?: number;
  is_active?: boolean;
  fundamental_ids?: number[];
}

// ── Class Drills (junction) ────────────────────────────────────────────

export interface ClassDrill {
  id: number;
  class_id: number;
  drill_id: number;
  is_homework: boolean;
  duration_minutes?: number;
  display_order: number;
  created_at: string;
  drill: Drill;
}

export interface ClassDrillCreate {
  drill_id: number;
  is_homework?: boolean;
  duration_minutes?: number;
  display_order?: number;
}

// ── Course Structure ───────────────────────────────────────────────────

export interface CourseMonth {
  id: number;
  course_id: number;
  month_index: number;
  title?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseMonthCreate {
  month_index: number;
  title?: string;
  display_order?: number;
}

export interface CourseMonthUpdate {
  month_index?: number;
  title?: string;
  display_order?: number;
}

export interface TrainingClass {
  id: number;
  course_month_id: number;
  week_index: number;
  title?: string;
  instructor_intro_script?: string;
  safety_reminder?: string;
  closing_script?: string;
  endstate?: string;
  round_count?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClassCreate {
  week_index: number;
  title?: string;
  instructor_intro_script?: string;
  safety_reminder?: string;
  closing_script?: string;
  endstate?: string;
  round_count?: number;
  display_order?: number;
}

export interface ClassUpdate {
  week_index?: number;
  title?: string;
  instructor_intro_script?: string;
  safety_reminder?: string;
  closing_script?: string;
  endstate?: string;
  round_count?: number;
  display_order?: number;
}

export interface ClassWithDrills extends TrainingClass {
  class_drills: ClassDrill[];
  global_week_number?: number;
}

export interface CourseMonthWithClasses extends CourseMonth {
  classes: ClassWithDrills[];
}

export interface CourseStructure {
  course_id: number;
  course_title: string;
  total_weeks: number;
  months: CourseMonthWithClasses[];
}

// ── Response wrappers ──────────────────────────────────────────────────

export interface DrillResponse {
  success: boolean;
  data?: Drill;
  message?: string;
  error?: string;
}

export interface DrillListResponse {
  success: boolean;
  data?: Drill[];
  error?: string;
}

export interface CourseStructureResponse {
  success: boolean;
  data?: CourseStructure;
  error?: string;
}

export interface ClassWithDrillsResponse {
  success: boolean;
  data?: ClassWithDrills;
  error?: string;
}

export interface TechnicalFundamentalResponse {
  success: boolean;
  data?: TechnicalFundamental;
  error?: string;
}

export interface TechnicalFundamentalListResponse {
  success: boolean;
  data?: TechnicalFundamental[];
  error?: string;
}
