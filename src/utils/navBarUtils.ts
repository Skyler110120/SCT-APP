/**
 * Pure utility for role-based nav items.
 * Used by BottomNavBar and testable without React/RN mocks.
 */
import { UserRole } from "../types/enums";

export interface NavItem {
  name: string;
  route: string;
}

/**
 * Returns nav items for the given role per OFFICIAL_ROLE_REQUIREMENTS.
 * MasterAdmin: system routes only
 * Admin: company management + calendar + users + courses
 * Instructor: learning + calendar + students + courses + profile
 * Student (default): learning + calendar + courses + profile
 */
export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (role === UserRole.MASTER_ADMIN) {
    return [
      { name: "Home", route: "/system/dashboard" },
      { name: "Courses", route: "/system/courses" },
    ];
  }
  if (role === UserRole.ADMIN) {
    return [
      { name: "Home", route: "/company/management/dashboard" },
      { name: "Calendar", route: "/company/calendar" },
      { name: "Users", route: "/company/management/users" },
      { name: "Courses", route: "/company/courses" },
    ];
  }
  if (role === UserRole.INSTRUCTOR) {
    return [
      { name: "Home", route: "/learning/dashboard" },
      { name: "Calendar", route: "/company/calendar" },
      { name: "Students", route: "/learning/students" },
      { name: "Courses", route: "/company/courses" },
      { name: "Profile", route: "/learning/profile" },
    ];
  }
  // Student or undefined (default student view)
  return [
    { name: "Home", route: "/learning/dashboard" },
    { name: "Calendar", route: "/company/calendar" },
    { name: "Courses", route: "/company/courses" },
    { name: "Profile", route: "/learning/profile" },
  ];
}
