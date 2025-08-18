export enum SessionStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface SessionBase {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
}

export interface Session extends SessionBase {
    id: number;
    instructor_id: number;
    student_id: number | null;
    company_id: number;
    course_id?: number | null;
    enrollment_id?: number | null;
    status: SessionStatus;
    created_at: string;
    updated_at: string;
}

export interface SessionDetailed extends Session {
    //User information
    instructor_name?: string;
    instructor_email?: string;
    student_name?: string;
    student_email?: string;
    company_name?: string;

    //Computed fields
    duration_minutes?: number;
    can_be_cancelled?: boolean;
    can_be_completed?: boolean

    //Course information
    course_title?: string
    course_description?: string;
    course_gun_type?: string;
    course_difficulty?: string;

    //Enrollment information
    enrollment_current_week?: number;
    enrollment_progress_display?: string;  
    enrollment_progress_percentage?: number;
    enrollment_status?: string;   
    enrollment_instructor_notes?: string;
}

export interface DirectBookingRequest extends SessionBase {
    instructor_id: number;
    student_id?: number;
}

export interface SessionUpdateRequest {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    status?: SessionStatus;
    course_id?: number;
    enrollment_id?: number;
}

export interface AvailabilityCheckRequest {
    instructor_id: number;
    start_time: string;
    end_time: string;
}

export interface ConflictDetail {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    student_name?: string;
    course_title?: string;
}

export interface AvailabilityCheckResponse {
    available: boolean;
    conflicts?: ConflictDetail[];
    message: string;
    instructor_name?: string;
}

export interface SessionResponse {
    success: boolean;
    data?: SessionDetailed;
    message?: string;
    error?: string;
}

export interface SessionListResponse {
    success: boolean;
    data?: SessionDetailed[];
    error?: string;
}

export interface AvailabilityCheckServiceResponse {
    success: boolean;
    data?: AvailabilityCheckResponse;
    error?: string;
}

export interface SessionActionResponse {
    success: boolean;
    data?: SessionDetailed;
    message?: string;
    error?: string;
}

export interface CalendarSessionsRequest {
    start_date: string;
    end_date: string;
}

export interface CalendarSessionsResponse extends SessionListResponse {}