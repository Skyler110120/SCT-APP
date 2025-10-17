//Enums to match backend enums
export enum DrillType {
    TIME = "TIME",
    SCORE = "SCORE",
    ACCURACY = "ACCURACY"
}

// Course Drill Types
export interface CreateCourseDrillRequest {
    course_id: number;
    drill_name: string;
    drill_type: DrillType;
    standard_value: number;
    standard_unit: string;
    display_order?: number;
    description?: string;
}

export interface UpdateCourseDrillRequest {
    drill_name?: string;
    drill_type?: DrillType;
    standard_value?: number;
    standard_unit?: string;
    display_order?: number;
    description?: string;
    is_active?: boolean;
}

export interface CourseDrill {
    id: number;
    course_id: number;
    drill_name: string;
    drill_type: DrillType;
    standard_value: number;
    standard_unit: string;
    display_order: number;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

//Student Drill Result Types
export interface StudentDrillResultUpdate {
    drill_id: number;
    current_value: number;
    passed?: boolean;
}

export interface StudentDrillResult {
    result_id?: number;
    drill_id: number;
    student_id: number;
    current_value?: number;
    passed?: boolean;
    result_created_at?: string;
    result_updated_at?: string;

    drill_name: string;
    drill_type: DrillType;
    standard_value: number;
    standard_unit: string;
    description?: string;

    beat_standard?: boolean;
    difference_from_standard?: number;
    status: string;
}

export interface StudentDrillSummary {
    student_id: number;
    course_id: number;
    total_drills: number;
    tested_drills: number;
    passed_drills: number;
    completion_percentage: number;
    drill_results: StudentDrillResult[];
}

export interface CourseDrillResponse {
    success: boolean;
    data?: CourseDrill;
    message?: string;
    error?: string;
}

export interface CourseDrillListResponse {
    success: boolean;
    data?: CourseDrill[];
    error?: string;
}

export interface StudentDrillProgressResponse {
    success: boolean;
    data?: StudentDrillSummary;
    error?: string;
}