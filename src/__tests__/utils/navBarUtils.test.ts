/**
 * Tests for navBarUtils.getNavItemsForRole.
 * Validates role-based nav per OFFICIAL_ROLE_REQUIREMENTS.
 */
import { getNavItemsForRole } from "../../utils/navBarUtils";
import { UserRole } from "../../types/enums";

describe("navBarUtils.getNavItemsForRole", () => {
  it("returns MasterAdmin nav: Home (system), Courses (system)", () => {
    const items = getNavItemsForRole(UserRole.MASTER_ADMIN);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ name: "Home", route: "/system/dashboard" });
    expect(items[1]).toEqual({ name: "Courses", route: "/system/courses" });
    expect(items.every((i) => i.route.startsWith("/system/"))).toBe(true);
  });

  it("returns Admin nav: Home, Calendar, Users, Courses", () => {
    const items = getNavItemsForRole(UserRole.ADMIN);
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Calendar",
      "Users",
      "Courses",
    ]);
    expect(items[0].route).toBe("/company/management/dashboard");
    expect(items[1].route).toBe("/company/calendar");
    expect(items[2].route).toBe("/company/management/users");
    expect(items[3].route).toBe("/company/courses");
  });

  it("returns Instructor nav: Home, Calendar, Students, Courses, Profile", () => {
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
