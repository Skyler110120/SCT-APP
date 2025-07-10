export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
    MASTER_ADMIN = 'masteradmin',
}

export interface User {
    company_id: number | null;
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    hasCompletedOnboarding: boolean;
    created_at?: string;
}

export interface UserUpdate {
    company_id?: number | null;
    role?: UserRole;
    first_name?: string;
    last_name?: string;
    hasCompletedOnboarding?: boolean;
    email?: string;
    is_active?: boolean;
}

export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export interface AuthResponse {
    success: boolean;
    data?: any;
    error?: string;
}