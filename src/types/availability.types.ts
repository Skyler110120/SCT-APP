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
}

export interface CreateAvailabilityRequest {
    day_of_week: number,
    start_time: string;
    end_time: string;
    start_date: string;
    end_date?: string;
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