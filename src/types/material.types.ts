export interface MaterialAccessRequest {

}

export interface MaterialAccessResponse {
    success: boolean;
    access_url: string;
    expires_at: string;
    expires_in_seconds: number;
    material_type: string;
    course_title: string;
    course_id: number;
}

export interface MaterialInfoResponse {
    course_id: number;
    course_title: string;
    has_pdf: boolean;
    has_script: boolean;
    can_access_script: boolean;
}

export interface MaterialErrorResponse {
    success: false;
    error: string;
}

export type MaterialResponse = MaterialAccessResponse | MaterialErrorResponse;

export interface MaterialInfoServiceResponse {
    success: boolean;
    data?: MaterialInfoResponse;
    error?: string;
}

export interface MaterialAccessServiceResponse {
    success: boolean;
    data?: MaterialAccessResponse;
    error?: string;
}