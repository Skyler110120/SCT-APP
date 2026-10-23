import { AvailabilityStatus } from "./enums"

export interface Availability {
    id: number;
    company_id: number;
    instructor_id: number;
    start_time: string;
    end_time: string;
    day_of_week: number;
    status: AvailabilityStatus;
    start_date: string;
    end_date?: string;
    instructor_name?: string;
}

export interface CreateAvailabilityRequest {
    day_of_week: number,
    start_time: string;
    end_time: string;
    start_date: string;
    end_date?: string;
}

export interface AdminCreateAvailabilityRequest extends CreateAvailabilityRequest {
    instructor_id: number;
}

export interface AvailabilityUpdate {
    start_time?: string;
    end_time?: string;
    day_of_week?: number;
    status?: AvailabilityStatus;
    start_date?: string;
    end_date?: string;
}

export interface AvailabilityResponse {
    success: boolean;
    data?: Availability;
    message?: string;
    error?: string;
}

export interface AvailabilityListResponse {
    success: boolean;
    data?: Availability[];
    error?: string;
}

export type TimeOffScope = "whole_day" | "slot" | "date_range";

export interface TimeOffRequest {
    scope: TimeOffScope;
    start_date: string;
    end_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    instructor_id?: number | null;
    cancel_affected_sessions: boolean;
}

export interface TimeOffResponse {
    unavailable_rows_created: number;
    cancelled_session_ids: number[];
}

export interface TimeOffConflictSession {
    id: number;
    start_time: string;
    end_time: string;
    title: string;
    status: string;
    student_name?: string | null;
    student_profile_picture?: string | null;
}

export interface TimeOffConflictDetail {
    code: string;
    message: string;
    sessions: TimeOffConflictSession[];
}

export type TimeOffResult =
    | { success: true; data: TimeOffResponse }
    | { success: false; error: string }
    | { success: false; conflict: TimeOffConflictDetail };