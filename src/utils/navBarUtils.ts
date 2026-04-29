/**
 * Pure utility for role-based nav items.
 * Used by BottomNavBar and testable without React/RN mocks.
 */
import { UserRole } from "../types/enums";
import type { User } from "../types/auth.types";

export interface NavItem {
  name: string;
  route: string;
}

/**
 * Returns nav items for the given role per OFFICIAL_ROLE_REQUIREMENTS.
 * MasterAdmin: system routes + profile
 * Admin: company management + calendar + users + courses + payments + profile
 * Instructor: learning + calendar + students + courses + profile
 * Student (default): learning + calendar + courses + profile
 */
export function getNavItemsForRole(
  role: string | undefined,
  user?: User | null
): NavItem[] {
  if (role === UserRole.MASTER_ADMIN) {
    return [
      { name: "Home", route: "/system/dashboard" },
      { name: "Users", route: "/system/users" },
      { name: "Courses", route: "/system/courses" },
      { name: "Profile", route: "/system/profile" },
    ];
  }
  if (role === UserRole.ADMIN) {
    return [
      { name: "Home", route: "/company/management/dashboard" },
      { name: "Calendar", route: "/company/calendar" },
      { name: "Users", route: "/company/management/users" },
      { name: "Courses", route: "/company/courses" },
      { name: "Payments", route: "/company/management/payments" },
      { name: "Profile", route: "/company/management/profile" },
    ];
  }
  if (role === UserRole.INSTRUCTOR) {
    const instructorItems: NavItem[] = [
      { name: "Home", route: "/learning/dashboard" },
      { name: "Calendar", route: "/company/calendar" },
      { name: "Students", route: "/learning/students" },
    ];
    if (user?.can_manage_others_permissions || user?.can_set_others_session_capacity) {
      instructorItems.push({ name: "Users", route: "/company/management/users" });
    }
    instructorItems.push(
      { name: "Courses", route: "/company/courses" },
      { name: "Profile", route: "/learning/profile" }
    );
    return instructorItems;
  }
  // Student or undefined (default student view)
  return [
    { name: "Home", route: "/learning/dashboard" },
    { name: "Calendar", route: "/company/calendar" },
    { name: "Courses", route: "/company/courses" },
    { name: "Profile", route: "/learning/profile" },
  ];
}
