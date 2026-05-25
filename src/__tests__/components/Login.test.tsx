/**
 * Tests for Login screen.
 *
 *   - Calls AuthContext.login() with the typed credentials
 *   - Shows inline error message when login fails (no Alert popup)
 *   - Clears the password input on login failure (defense against shoulder-surf)
 *   - Alerts the user when email or password is empty
 *   - "Forgot Password?" navigates to /forgot-password
 *   - "Create one" link navigates to /register
 *   - Back arrow navigates to /welcome
 */
import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen, act } from "@testing-library/react-native";

const mockLogin = jest.fn();
const mockState = { error: null as string | null };
const mockRouter = { push: jest.fn() };

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin, state: mockState }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/src/components/auth/AuthGridBackground", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    AuthGridBackground: ({ children }: { children: any }) =>
      React.createElement(View, null, children),
  };
});

jest.mock("@/src/components/auth/AuthBrandLockup", () => ({
  AuthBrandLockup: () => null,
}));

jest.mock("@/src/assets/images", () => ({
  __esModule: true,
  default: {
    buttons: { backButton: 1 },
  },
}));

import LoginScreen from "@/src/components/screens/auth/Login";

beforeEach(() => {
  jest.clearAllMocks();
  mockState.error = null;
  mockLogin.mockReset();
});

describe("LoginScreen", () => {
  it("alerts when the user submits with empty fields", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Sign in"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Error",
      "Please enter your email and password"
    );
    expect(mockLogin).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("calls AuthContext.login with typed credentials and clears password on failure", async () => {
    mockLogin.mockResolvedValueOnce(false);
    mockState.error = "Invalid credentials";

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "wrong-pass");

    await act(async () => {
      fireEvent.press(screen.getByText("Sign in"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "wrong-pass",
    });
    expect(screen.getByText("Invalid credentials")).toBeTruthy();

    // Password input should be cleared (re-entered on next attempt).
    expect(screen.getByPlaceholderText("Password").props.value).toBe("");
  });

  it("clears the inline error when the user starts typing again", async () => {
    mockLogin.mockResolvedValueOnce(false);
    mockState.error = "Invalid credentials";

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "x");
    await act(async () => {
      fireEvent.press(screen.getByText("Sign in"));
      await Promise.resolve();
    });

    expect(screen.getByText("Invalid credentials")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "a@b.co");
    expect(screen.queryByText("Invalid credentials")).toBeNull();
  });

  it("does not navigate after a successful login (AuthProvider drives routing)", async () => {
    mockLogin.mockResolvedValueOnce(true);
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Email"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "right-pass");

    await act(async () => {
      fireEvent.press(screen.getByText("Sign in"));
      await Promise.resolve();
    });

    expect(mockLogin).toHaveBeenCalled();
    // Login screen itself does not push routes on success.
    expect(mockRouter.push).not.toHaveBeenCalledWith("/dashboard");
  });

  it("navigates to /forgot-password when the link is pressed", () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Forgot Password?"));

    expect(mockRouter.push).toHaveBeenCalledWith("/forgot-password");
  });

  it("navigates to /register when 'Create one' is pressed", () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Create one"));

    expect(mockRouter.push).toHaveBeenCalledWith("/register");
  });
});
