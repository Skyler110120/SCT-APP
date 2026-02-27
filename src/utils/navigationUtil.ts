import { router } from "expo-router";
import { UserRole } from "../types/auth.types";

/**
 * Navigates the user to the correct dashboard based on their role
 * @param {UserRole} role - user's role
 * @param hasCompletedOnboarding - boolean indicating if the user completed onboarding
 */

export const navigateByRole = (
    role: UserRole,
    hasCompletedOnboarding: boolean
): void => {
    if(!hasCompletedOnboarding) {
        router.replace("/dashboard")
        return;
    }
    if (role === UserRole.MASTER_ADMIN) {
        router.replace("/system/dashboard")
    } else if (role === UserRole.ADMIN) { 
        router.replace("/company/management/dashboard")
    } else if (role === UserRole.INSTRUCTOR) {
        router.replace("/learning/dashboard")
    } else {
        router.replace("/learning/dashboard")
    }
}