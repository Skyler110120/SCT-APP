export interface Event {
    id: number;
    company_id: number;
    title: string;
    description: string;
    image: string | null;
    start_time: string
    end_time: string;
    created_by_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEventRequest {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    image?: string | null;
    start_time?: string;
    end_time?: string;
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