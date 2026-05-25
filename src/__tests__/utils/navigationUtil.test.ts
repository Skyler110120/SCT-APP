/**
 * Tests for navigateByRole — the routing decision that sends an authenticated
 * user to the right dashboard (or back to /dashboard for onboarding). This is
 * called by AuthContext + RouteGuard so a regression here can ship the wrong
 * user to the wrong screen.
 */
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

import { router } from "expo-router";
import { navigateByRole } from "../../utils/navigationUtil";
import { UserRole } from "../../types/enums";

const mockReplace = router.replace as jest.MockedFunction<typeof router.replace>;

beforeEach(() => {
  mockReplace.mockReset();
});

describe("navigateByRole", () => {
  it("routes incomplete onboarding to /dashboard regardless of role", () => {
    navigateByRole(UserRole.STUDENT, false);
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");

    mockReplace.mockReset();
    navigateByRole(UserRole.ADMIN, false);
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");

    mockReplace.mockReset();
    navigateByRole(UserRole.MASTER_ADMIN, false);
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("routes master admin to system dashboard", () => {
    navigateByRole(UserRole.MASTER_ADMIN, true);
    expect(mockReplace).toHaveBeenCalledWith("/system/dashboard");
  });

  it("routes admin to company management dashboard", () => {
    navigateByRole(UserRole.ADMIN, true);
    expect(mockReplace).toHaveBeenCalledWith("/company/management/dashboard");
  });

  it("routes instructor to learning dashboard", () => {
    navigateByRole(UserRole.INSTRUCTOR, true);
    expect(mockReplace).toHaveBeenCalledWith("/learning/dashboard");
  });

  it("routes student to learning dashboard", () => {
    navigateByRole(UserRole.STUDENT, true);
    expect(mockReplace).toHaveBeenCalledWith("/learning/dashboard");
  });
});
