export interface Event {
    id: number;
    companyId: number;
    title: string;
    description: string;
    image: string | null;
    startTime: string
    endTime: string;
    createdById: number;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    image?: string | null;
    startTime?: string;
    endTime?: string;
}

export interface EventResponse {
    success: boolean;
    data?: Event;
    error?: string
}

export interface EventListResponse {
    success: boolean;
    data?: Event[];
    error?: string;
}