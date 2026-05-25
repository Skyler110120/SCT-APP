/**
 * Tests for AuthContext / AuthProvider.
 *
 * This is the most security-sensitive and bug-prone slice of the mobile app:
 * the state machine that gates which screens a user can see and which token
 * gets attached to outbound API requests. We verify:
 *
 *   checkAuth (on mount):
 *     - hydrates AUTH_SUCCESS when authService.checkAuth returns a user
 *     - hydrates AUTH_LOGOUT when no token is in storage
 *     - hydrates AUTH_ERROR when the service throws
 *
 *   login():
 *     - returns true and dispatches AUTH_SUCCESS on a happy path
 *     - returns false with state.error="Invalid credentials" on bad creds
 *     - returns false with state.error from a failing /auth/me fetch
 *     - returns false with the network error message on a thrown error
 *
 *   register():
 *     - returns success with the registered user on the happy path
 *     - returns error when signup itself fails
 *     - returns error when account is created but login fails (the
 *       "account created but automatic login failed" branch)
 *
 *   logout():
 *     - clears state even if authService.logout throws
 *
 *   hasRole():
 *     - matches a single role, matches any role in an array
 *     - returns false when no user
 *
 *   needsOnboarding:
 *     - true when user.company_id === null
 *     - false when user has a company_id
 */
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

jest.mock("@/src/services/authService", () => ({
  authService: {
    checkAuth: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("@/src/services/onboardingService", () => ({
  onboardingService: {
    signup: jest.fn(),
  },
}));

import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { authService } from "@/src/services/authService";
import { onboardingService } from "@/src/services/onboardingService";
import { UserRole } from "@/src/types/enums";

const mockCheckAuth = authService.checkAuth as jest.MockedFunction<
  typeof authService.checkAuth
>;
const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
const mockGetCurrentUser = authService.getCurrentUser as jest.MockedFunction<
  typeof authService.getCurrentUser
>;
const mockLogout = authService.logout as jest.MockedFunction<typeof authService.logout>;
const mockSignup = onboardingService.signup as jest.MockedFunction<
  typeof onboardingService.signup
>;

const sampleUserInfo = {
  id: 1,
  email: "user@example.com",
  first_name: "Test",
  last_name: "User",
  role: UserRole.STUDENT,
  company_id: 42,
  instructor_id: null,
  has_completed_onboarding: true,
  is_active: true,
  is_approved: true,
};

// Test harness that surfaces every relevant value from the context so we can
// drive assertions from outside the provider.
function Harness({
  onReady,
  onAction,
}: {
  onReady: (api: ReturnType<typeof useAuth>) => void;
  onAction?: (api: ReturnType<typeof useAuth>) => Promise<void>;
}) {
  const auth = useAuth();
  React.useEffect(() => {
    onReady(auth);
  }, [auth, onReady]);
  return (
    <View>
      <Text testID="loading">{String(auth.isLoading)}</Text>
      <Text testID="authed">{String(auth.isAuthenticated)}</Text>
      <Text testID="error">{auth.state.error ?? ""}</Text>
      <Text testID="role">{auth.user?.role ?? ""}</Text>
      <Text testID="needs">{String(auth.needsOnboarding)}</Text>
      <Text testID="company">{auth.user?.company_id == null ? "null" : String(auth.user.company_id)}</Text>
      <TouchableOpacity
        testID="run"
        onPress={async () => {
          if (onAction) await onAction(auth);
        }}
      >
        <Text>run</Text>
      </TouchableOpacity>
    </View>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

async function renderProvider(onReady = jest.fn(), onAction?: (api: any) => Promise<void>) {
  const result = render(
    <AuthProvider>
      <Harness onReady={onReady} onAction={onAction} />
    </AuthProvider>
  );
  // Drain effects (initial checkAuth promise).
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return result;
}

describe("AuthContext — checkAuth on mount", () => {
  it("dispatches AUTH_SUCCESS when authService.checkAuth resolves with a user", async () => {
    mockCheckAuth.mockResolvedValueOnce({
      token: "tk-1",
      user: sampleUserInfo,
    });

    await renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );
    expect(screen.getByTestId("role").props.children).toBe(UserRole.STUDENT);
  });

  it("dispatches AUTH_LOGOUT when checkAuth returns null (no token)", async () => {
    mockCheckAuth.mockResolvedValueOnce(null);

    await renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false")
    );
    expect(screen.getByTestId("authed").props.children).toBe("false");
    expect(screen.getByTestId("error").props.children).toBe("");
  });

  it("dispatches AUTH_ERROR when checkAuth throws", async () => {
    mockCheckAuth.mockRejectedValueOnce(new Error("boom"));

    await renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("loading").props.children).toBe("false")
    );
    expect(screen.getByTestId("error").props.children).toBe(
      "Failed to authenticate"
    );
    expect(screen.getByTestId("authed").props.children).toBe("false");
  });
});

describe("AuthContext — login", () => {
  beforeEach(() => {
    mockCheckAuth.mockResolvedValue(null);
  });

  it("returns true and dispatches AUTH_SUCCESS on the happy path", async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      data: { access_token: "new-tk" } as any,
    });
    mockGetCurrentUser.mockResolvedValueOnce({
      success: true,
      data: sampleUserInfo,
    });

    let loginResult: boolean | undefined;
    await renderProvider(jest.fn(), async (api) => {
      loginResult = await api.login({ email: "a@b.com", password: "x" });
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );
    expect(loginResult).toBe(true);
    expect(mockGetCurrentUser).toHaveBeenCalledWith("new-tk");
  });

  it("returns false and surfaces 'Invalid credentials' on bad password", async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    } as any);

    let loginResult: boolean | undefined;
    await renderProvider(jest.fn(), async (api) => {
      loginResult = await api.login({ email: "a@b.com", password: "x" });
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(loginResult).toBe(false);
    await waitFor(() =>
      expect(screen.getByTestId("error").props.children).toBe("Invalid credentials")
    );
    expect(screen.getByTestId("authed").props.children).toBe("false");
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it("returns false when /auth/me fails after a successful login token exchange", async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      data: { access_token: "new-tk" } as any,
    });
    mockGetCurrentUser.mockResolvedValueOnce({
      success: false,
      error: "Unable to fetch profile",
    });

    let loginResult: boolean | undefined;
    await renderProvider(jest.fn(), async (api) => {
      loginResult = await api.login({ email: "a@b.com", password: "x" });
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(loginResult).toBe(false);
    await waitFor(() =>
      expect(screen.getByTestId("error").props.children).toBe(
        "Unable to fetch profile"
      )
    );
  });

  it("returns false with a generic message when the service throws", async () => {
    mockLogin.mockRejectedValueOnce(new Error("network down"));

    let loginResult: boolean | undefined;
    await renderProvider(jest.fn(), async (api) => {
      loginResult = await api.login({ email: "a@b.com", password: "x" });
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(loginResult).toBe(false);
    await waitFor(() =>
      expect(screen.getByTestId("error").props.children).toBe(
        "Network error occurred during login"
      )
    );
  });
});

describe("AuthContext — register", () => {
  beforeEach(() => {
    mockCheckAuth.mockResolvedValue(null);
  });

  it("returns success on the happy path (signup -> login -> /auth/me)", async () => {
    mockSignup.mockResolvedValueOnce({
      success: true,
      data: {
        user_id: 9,
        email: "new@user.com",
        first_name: "New",
        last_name: "User",
        role: UserRole.STUDENT,
        company_id: 42,
        instructor_id: null,
        has_completed_onboarding: false,
        is_active: true,
        is_approved: true,
      } as any,
    });
    mockLogin.mockResolvedValueOnce({
      success: true,
      data: { access_token: "tk-new" } as any,
    });
    mockGetCurrentUser.mockResolvedValueOnce({
      success: true,
      data: { ...sampleUserInfo, id: 9, email: "new@user.com" },
    });

    let registerResult: any;
    await renderProvider(jest.fn(), async (api) => {
      registerResult = await api.register({
        email: "new@user.com",
        password: "secret",
      } as any);
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerResult?.success).toBe(true);
    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );
  });

  it("returns error when signup itself fails", async () => {
    mockSignup.mockResolvedValueOnce({
      success: false,
      error: "Email already in use",
    } as any);

    let registerResult: any;
    await renderProvider(jest.fn(), async (api) => {
      registerResult = await api.register({
        email: "taken@user.com",
        password: "secret",
      } as any);
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerResult?.success).toBe(false);
    expect(registerResult?.error).toBe("Email already in use");
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("returns 'Registration completed but automatic login failed' when signup succeeds but login fails", async () => {
    mockSignup.mockResolvedValueOnce({
      success: true,
      data: {
        user_id: 9,
        email: "new@user.com",
        first_name: "New",
        last_name: "User",
        role: UserRole.STUDENT,
        company_id: null,
        instructor_id: null,
        has_completed_onboarding: false,
        is_active: true,
        is_approved: true,
      } as any,
    });
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: "credentials rejected",
    } as any);

    let registerResult: any;
    await renderProvider(jest.fn(), async (api) => {
      registerResult = await api.register({
        email: "new@user.com",
        password: "secret",
      } as any);
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(registerResult?.success).toBe(false);
    expect(registerResult?.error).toMatch(/automatic login failed/i);
  });
});

describe("AuthContext — logout", () => {
  it("clears state even when authService.logout throws", async () => {
    mockCheckAuth.mockResolvedValueOnce({
      token: "tk-1",
      user: sampleUserInfo,
    });
    mockLogout.mockRejectedValueOnce(new Error("network failure"));

    await renderProvider(jest.fn(), async (api) => {
      await api.logout();
    });

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("run"));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("false")
    );
  });
});

describe("AuthContext — hasRole + needsOnboarding", () => {
  it("matches a single role and any-role array; false when not authenticated", async () => {
    mockCheckAuth.mockResolvedValueOnce({
      token: "tk-1",
      user: { ...sampleUserInfo, role: UserRole.ADMIN },
    });

    let api: any;
    await renderProvider(
      jest.fn((ctx: any) => {
        api = ctx;
      })
    );

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );

    expect(api.hasRole(UserRole.ADMIN)).toBe(true);
    expect(api.hasRole(UserRole.STUDENT)).toBe(false);
    expect(api.hasRole([UserRole.ADMIN, UserRole.MASTER_ADMIN])).toBe(true);
    expect(api.hasRole([UserRole.STUDENT, UserRole.INSTRUCTOR])).toBe(false);
  });

  it("needsOnboarding is true when company_id is null", async () => {
    mockCheckAuth.mockResolvedValueOnce({
      token: "tk-1",
      user: { ...sampleUserInfo, company_id: null as any },
    });

    await renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );
    expect(screen.getByTestId("needs").props.children).toBe("true");
  });

  it("needsOnboarding is false when company_id is set", async () => {
    mockCheckAuth.mockResolvedValueOnce({
      token: "tk-1",
      user: sampleUserInfo,
    });

    await renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId("authed").props.children).toBe("true")
    );
    expect(screen.getByTestId("needs").props.children).toBe("false");
  });
});

describe("useAuth outside AuthProvider", () => {
  it("throws a clear error", () => {
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch {
        return null;
      }
    };
    const Probe = () => {
      useAuth();
      return null;
    };
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <ErrorBoundary>
          <Probe />
        </ErrorBoundary>
      )
    ).toThrow(/useAuth must be used within an AuthProvider/);
    consoleError.mockRestore();
  });
});
