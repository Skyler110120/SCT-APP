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
        router.replace("/screens/app/InstructorDashboard")
    }
    if (role === UserRole.MASTER_ADMIN) {
        router.replace("/screens/app/MasterAdminDashboard")
    } else if (role === UserRole.ADMIN) { 
        router.replace("/screens/app/AdminDashboard")
    } else if (role === UserRole.INSTRUCTOR) {
        router.replace("/screens/app/InstructorDashboard")
    } else {
        router.replace("/screens/app/InstructorDashboard")
    }
}