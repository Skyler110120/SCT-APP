/**
 * Tests for RouteGuard — the imperative gate that redirects:
 *
 *   - Unauthenticated user landing on a protected route -> /login
 *   - Authenticated user landing on an auth route -> role dashboard via
 *     navigateByRole(role, has_completed_onboarding)
 *   - Authenticated non-admin trying to load admin screens ->
 *     navigateByRole back to their own dashboard
 *   - Authenticated non-master-admin trying to load master-admin screens ->
 *     navigateByRole back to their own dashboard
 *   - Shows a spinner while AuthContext is still loading
 *
 * These guard checks are critical: a regression can either ship a logged-out
 * user into private routes, or trap a student behind an auth wall.
 */
import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

let mockAuth: any = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  hasRole: jest.fn(() => false),
};
let mockSegments: string[] = [];
const mockReplace = jest.fn();
const mockNavigateByRole = jest.fn();

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => mockSegments,
}));

jest.mock("@/src/utils/navigationUtil", () => ({
  navigateByRole: (...args: any[]) => mockNavigateByRole(...args),
}));

import { RouteGuard } from "@/src/components/RouteGuard";
import { UserRole } from "@/src/types/enums";

function withSegments(segments: string[]) {
  mockSegments = segments;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    hasRole: jest.fn(() => false),
  };
  mockSegments = [];
});

describe("RouteGuard", () => {
  it("renders a spinner while AuthContext is loading and does not redirect", () => {
    mockAuth.isLoading = true;
    withSegments(["screens", "app", "dashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated visitor on a protected /screens route to /login", () => {
    mockAuth.isAuthenticated = false;
    withSegments(["screens", "app", "dashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirects an authenticated user away from an auth route via navigateByRole", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.STUDENT,
      has_completed_onboarding: true,
    };
    withSegments(["screens", "auth", "login"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).toHaveBeenCalledWith(UserRole.STUDENT, true);
  });

  it("redirects an authenticated visitor on top-level /auth routes via navigateByRole", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.INSTRUCTOR,
      has_completed_onboarding: true,
    };
    withSegments(["auth", "login"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).toHaveBeenCalledWith(UserRole.INSTRUCTOR, true);
  });

  it("falls back to /welcome if user is authenticated on auth route but no user object exists", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = null;
    withSegments(["auth", "login"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/welcome");
  });

  it("kicks a non-master-admin off masterAdminDashboard routes", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.STUDENT,
      has_completed_onboarding: true,
    };
    mockAuth.hasRole = jest.fn((roles: any) => {
      if (Array.isArray(roles)) return roles.includes(UserRole.STUDENT);
      return roles === UserRole.STUDENT;
    });
    withSegments(["screens", "app", "masterAdminDashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).toHaveBeenCalledWith(UserRole.STUDENT, true);
  });

  it("kicks a student off adminDashboard routes", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.STUDENT,
      has_completed_onboarding: true,
    };
    mockAuth.hasRole = jest.fn(() => false);
    withSegments(["screens", "app", "adminDashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).toHaveBeenCalledWith(UserRole.STUDENT, true);
  });

  it("does NOT redirect an authenticated student on a non-admin protected screen", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.STUDENT,
      has_completed_onboarding: true,
    };
    withSegments(["screens", "app", "dashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNavigateByRole).not.toHaveBeenCalled();
  });

  it("allows an admin user to load adminDashboard routes", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.ADMIN,
      has_completed_onboarding: true,
    };
    mockAuth.hasRole = jest.fn((roles: any) => {
      if (Array.isArray(roles)) return roles.includes(UserRole.ADMIN);
      return roles === UserRole.ADMIN;
    });
    withSegments(["screens", "app", "adminDashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).not.toHaveBeenCalled();
  });

  it("allows a master-admin to load masterAdminDashboard routes", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = {
      role: UserRole.MASTER_ADMIN,
      has_completed_onboarding: true,
    };
    mockAuth.hasRole = jest.fn((roles: any) => {
      if (Array.isArray(roles)) return roles.includes(UserRole.MASTER_ADMIN);
      return roles === UserRole.MASTER_ADMIN;
    });
    withSegments(["screens", "app", "masterAdminDashboard"]);

    render(
      <RouteGuard>
        <Text>child</Text>
      </RouteGuard>
    );

    expect(mockNavigateByRole).not.toHaveBeenCalled();
  });
});
