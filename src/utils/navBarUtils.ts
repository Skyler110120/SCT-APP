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

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
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

/** First tab for the role. Android back from any other tab returns here. */
export function getHomeRouteForRole(
  role: string | undefined,
  user?: User | null
): string {
  return getNavItemsForRole(role, user)[0]?.route ?? "/learning/dashboard";
}

/** True for a bottom-bar destination. Deeper screens such as a session form are not tab roots. */
export function isTabRootRoute(
  pathname: string,
  role: string | undefined,
  user?: User | null
): boolean {
  const path = normalizePath(pathname);
  return getNavItemsForRole(role, user).some((item) => item.route === path);
}

export type AndroidBackDecision = "home" | "exit" | "system";

/**
 * The bottom bar is not a history stack. From a tab, Android back returns to that
 * role's home. From home, it leaves the app. A screen opened on top of a tab still
 * uses the normal back behavior.
 */
export function decideAndroidBack(
  pathname: string,
  role: string | undefined,
  user?: User | null
): AndroidBackDecision {
  const path = normalizePath(pathname);
  if (!isTabRootRoute(path, role, user)) return "system";
  if (path === getHomeRouteForRole(role, user)) return "exit";
  return "home";
}
