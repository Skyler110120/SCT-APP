import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useFocusEffect: (effect: () => void | (() => void)) => {
    const ReactLib = require("react");
    ReactLib.useEffect(() => {
      const cleanup = effect();
      return typeof cleanup === "function" ? cleanup : undefined;
    }, [effect]);
  },
}));

jest.mock("expo-linking", () => ({
  createURL: (path: string) => path,
}));

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ user: { first_name: "Ava", role: "STUDENT" } }),
}));

jest.mock("@/src/components/NavBar", () => () => null);
jest.mock("@/src/components/student/StudentCancelSessionModal", () => () => null);

jest.mock("react-native-safe-area-context", () => {
  const ReactLib = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      ReactLib.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("@/src/services/courseService", () => ({
  courseService: { getMyEnrolledCourse: jest.fn() },
}));

jest.mock("@/src/services/paymentService", () => ({
  paymentService: { getSubscriptionStatus: jest.fn() },
}));

jest.mock("@/src/services/sessionService", () => ({
  sessionService: { getMyCalendarSessions: jest.fn() },
}));

import StudentDashboard from "@/src/components/screens/app/StudentDashboard";
import { courseService } from "@/src/services/courseService";
import { paymentService } from "@/src/services/paymentService";
import { sessionService } from "@/src/services/sessionService";

const mockCourse = courseService.getMyEnrolledCourse as jest.Mock;
const mockSubscription = paymentService.getSubscriptionStatus as jest.Mock;
const mockSessions = sessionService.getMyCalendarSessions as jest.Mock;

describe("StudentDashboard course week link", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscription.mockResolvedValue({
      has_subscription: true,
      can_book_sessions: true,
      cancel_at_period_end: false,
      amount_cents: 20000,
      make_up_sessions_remaining: 0,
      status: "ACTIVE",
      enrollment_phase: "NORMAL",
    });
    mockSessions.mockResolvedValue({ success: true, data: [] });
  });

  it("opens Courses on the student's current curriculum week", async () => {
    mockCourse.mockResolvedValue({
      success: true,
      data: {
        id: 4,
        current_week: 7,
        progress_percentage: 25,
        current_month: 2,
        current_week_in_month: 3,
        week_display: "Month 2 Week 3",
        program_cadence: "WEEKLY",
        weeks_missed: 0,
        enrolled_at: "2026-01-05",
        enrollment_phase: "NORMAL",
        make_up_sessions_remaining: 0,
        course: { id: 3, title: "Pistol 101", total_weeks: 24, videos: [] },
      },
    });

    render(<StudentDashboard />);

    fireEvent.press(await screen.findByText("Courses"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/company/courses",
      params: { week: "7" },
    });
  });
});
