export enum AvailabilityStatus {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
    BOOKED = "booked"
}

export interface Availability {
    id: number;
    companyId: number;
    instructorId: number;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    status: AvailabilityStatus;
    startDate: string;
    endDate?: string;
}

export interface AvailabilityUpdate {
    startTime?: string;
    endTime?: string;
    dayOfWeek?: number;
    status?: AvailabilityStatus;
    startDate?: string;
    endDate?: string;
}

export interface AvailabilityResponse {
    success: boolean;
    data?: Availability;
    error?: string;
}