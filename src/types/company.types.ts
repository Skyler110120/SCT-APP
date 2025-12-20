import { UserRole } from "./enums"

export interface Company {
    id: number;
    name: string;
    slug: string;
    website?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CompanyWithUserCount extends Company {
    user_count: number;
}

export interface CreateCompanyRequest {
    name: string;
    slug?: string
    website?: string | null;
}

export interface CompanyStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    pending_invites: number;
}

export interface UpdateCompanyRequest {
    name?: string;
    slug?: string;
    website?: string | null;
    is_active?: boolean;
}

export interface InviteCode {
    id: number;
    code: string;
    company_id: number;
    role: UserRole;
    created_by_id: number;
    max_uses: number;
    uses: number;
    expires_at: string | null;
    created_at: string;
    is_active: boolean;
}

export interface CreateInviteCodeRequest {
    company_id: number;
    role: UserRole;
}

export interface CompanyResponse {
    success: boolean;
    data?: Company
    error?: string;
}

export interface CompanyListResponse {
    success: boolean;
    data?: Company[];
    error?: string;
}

export interface InviteCodeResponse {
    success: boolean;
    data?: InviteCode;
    error?: string;
}

export interface InviteCodeListResponse {
    success: boolean;
    data?: InviteCode[];
    error?: string;
}