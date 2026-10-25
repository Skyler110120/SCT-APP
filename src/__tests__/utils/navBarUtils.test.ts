/**
 * Tests for navBarUtils.getNavItemsForRole.
 * Validates role-based nav per OFFICIAL_ROLE_REQUIREMENTS.
 */
import { decideAndroidBack, getHomeRouteForRole, getNavItemsForRole } from "../../utils/navBarUtils";
import { UserRole } from "../../types/enums";

describe("navBarUtils.getNavItemsForRole", () => {
  it("returns MasterAdmin nav: Home, Users, Courses, Profile", () => {
    const items = getNavItemsForRole(UserRole.MASTER_ADMIN);
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ name: "Home", route: "/system/dashboard" });
    expect(items[1]).toEqual({ name: "Users", route: "/system/users" });
    expect(items[2]).toEqual({ name: "Courses", route: "/system/courses" });
    expect(items[3]).toEqual({ name: "Profile", route: "/system/profile" });
    expect(items.every((i) => i.route.startsWith("/system/"))).toBe(true);
  });

  it("returns Admin nav: Home, Calendar, Users, Courses, Payments, Profile", () => {
    const items = getNavItemsForRole(UserRole.ADMIN);
    expect(items).toHaveLength(6);
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Calendar",
      "Users",
      "Courses",
      "Payments",
      "Profile",
    ]);
    expect(items[0].route).toBe("/company/management/dashboard");
    expect(items[1].route).toBe("/company/calendar");
    expect(items[2].route).toBe("/company/management/users");
    expect(items[3].route).toBe("/company/courses");
    expect(items[4].route).toBe("/company/management/payments");
    expect(items[5].route).toBe("/company/management/profile");
  });

  it("returns Instructor nav without users when no permissions", () => {
    const items = getNavItemsForRole(UserRole.INSTRUCTOR);
    expect(items).toHaveLength(5);
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Calendar",
      "Students",
      "Courses",
      "Profile",
    ]);
    expect(items[0].route).toBe("/learning/dashboard");
    expect(items[2].route).toBe("/learning/students");
    expect(items[4].route).toBe("/learning/profile");
  });

  it("returns Instructor nav with users when permissions allow", () => {
    const items = getNavItemsForRole(UserRole.INSTRUCTOR, {
      can_manage_others_permissions: true,
    } as any);
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Calendar",
      "Students",
      "Users",
      "Courses",
      "Profile",
    ]);
    expect(items[3].route).toBe("/company/management/users");
  });

  it("returns Student nav: Home, Calendar, Courses, Profile (no Users, no Students)", () => {
    const items = getNavItemsForRole(UserRole.STUDENT);
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Calendar",
      "Courses",
      "Profile",
    ]);
    expect(items.some((i) => i.name === "Users")).toBe(false);
    expect(items.some((i) => i.name === "Students")).toBe(false);
    expect(items[0].route).toBe("/learning/dashboard");
    expect(items[1].route).toBe("/company/calendar");
  });

  it("returns Student nav when role is undefined", () => {
    const items = getNavItemsForRole(undefined);
    expect(items).toHaveLength(4);
    expect(items[0].route).toBe("/learning/dashboard");
    expect(items.some((i) => i.name === "Users")).toBe(false);
  });

  it("MasterAdmin has no company/management routes", () => {
    const items = getNavItemsForRole(UserRole.MASTER_ADMIN);
    expect(items.some((i) => i.route.includes("company/management"))).toBe(
      false
    );
  });

  it("Admin has Users but not system-level courses", () => {
    const items = getNavItemsForRole(UserRole.ADMIN);
    expect(items.some((i) => i.name === "Users")).toBe(true);
    expect(items.some((i) => i.route === "/system/courses")).toBe(false);
  });
});

describe("navBarUtils.decideAndroidBack", () => {
  it("sends a student from Courses or Calendar back to the student home", () => {
    expect(getHomeRouteForRole(UserRole.STUDENT)).toBe("/learning/dashboard");
    expect(decideAndroidBack("/company/courses", UserRole.STUDENT)).toBe("home");
    expect(decideAndroidBack("/company/calendar/", UserRole.STUDENT)).toBe("home");
  });

  it("leaves the app when Android back is pressed on that role's home tab", () => {
    expect(decideAndroidBack("/learning/dashboard", UserRole.STUDENT)).toBe("exit");
    expect(decideAndroidBack("/company/management/dashboard", UserRole.ADMIN)).toBe("exit");
    expect(decideAndroidBack("/system/dashboard", UserRole.MASTER_ADMIN)).toBe("exit");
  });

  it("keeps the normal back behavior for screens opened on top of a tab", () => {
    expect(decideAndroidBack("/company/calendar/session-form", UserRole.STUDENT)).toBe("system");
    expect(decideAndroidBack("/learning/profile/42", UserRole.INSTRUCTOR)).toBe("system");
  });

  it("uses each role's own home, including an instructor who can open Users", () => {
    const instructor = { can_manage_others_permissions: true } as any;
    expect(decideAndroidBack("/company/management/users", UserRole.INSTRUCTOR, instructor)).toBe("home");
    expect(getHomeRouteForRole(UserRole.INSTRUCTOR, instructor)).toBe("/learning/dashboard");
    expect(decideAndroidBack("/company/management/users", UserRole.STUDENT)).toBe("system");
  });
});
