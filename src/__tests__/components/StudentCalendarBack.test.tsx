import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";

const mockFocus: { cleanup?: () => void } = {};
const mockCalendarProps: { current: null | Record<string, any> } = { current: null };
const mockUser = { id: 3, role: "STUDENT", company_id: 1, first_name: "Ava" };

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ date: "2026-11-02" }),
  useFocusEffect: (effect: () => void | (() => void)) => {
    const ReactLib = require("react");
    ReactLib.useEffect(() => {
      const cleanup = effect();
      mockFocus.cleanup = typeof cleanup === "function" ? cleanup : undefined;
      return () => {
        mockFocus.cleanup?.();
        mockFocus.cleanup = undefined;
      };
    }, [effect]);
  },
}));

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("@/src/components/NavBar", () => () => null);
jest.mock("@/src/components/BackgroundGradient", () => {
  const ReactLib = require("react");
  return ({ children }: { children: React.ReactNode }) =>
    ReactLib.createElement(ReactLib.Fragment, null, children);
});
jest.mock("@/src/components/SessionBookingModal", () => () => null);
jest.mock("@/src/components/SessionDetailsModal", () => () => null);
jest.mock("@/src/components/student/StudentCancelSessionModal", () => () => null);
jest.mock("@/src/components/instructor/InstructorAvailabilityModal", () => () => null);
jest.mock("@/src/components/instructor/TimeOffModal", () => () => null);
jest.mock("@/src/components/admin/CreateEventModal", () => () => null);

jest.mock("react-native-safe-area-context", () => {
  const ReactLib = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      ReactLib.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("react-native-calendars", () => {
  const ReactLib = require("react");
  const { View } = require("react-native");
  return {
    Calendar: (props: Record<string, any>) => {
      mockCalendarProps.current = props;
      const header = typeof props.renderHeader === "function" ? props.renderHeader() : null;
      return ReactLib.createElement(View, { testID: "month-calendar" }, header);
    },
  };
});

jest.mock("@/src/services/courseService", () => ({
  courseService: { getMyEnrolledCourse: jest.fn() },
}));
jest.mock("@/src/services/eventService", () => ({
  eventService: { getEventsByCompanyAndTimeRange: jest.fn() },
}));
jest.mock("@/src/services/sessionService", () => ({
  sessionService: { getMyCalendarSessions: jest.fn() },
}));
jest.mock("@/src/services/instructorAvailabilityService", () => ({
  instructorAvailabilityService: { getCompanyAvailability: jest.fn() },
}));
jest.mock("@/src/services/userService", () => ({
  userService: { getInstructorsByCompany: jest.fn() },
}));

import CalendarScreen from "@/src/components/screens/app/Calendar";
import { courseService } from "@/src/services/courseService";
import { eventService } from "@/src/services/eventService";
import { instructorAvailabilityService } from "@/src/services/instructorAvailabilityService";
import { sessionService } from "@/src/services/sessionService";

const mockCourse = courseService.getMyEnrolledCourse as jest.Mock;
const mockEvents = eventService.getEventsByCompanyAndTimeRange as jest.Mock;
const mockAvailability = instructorAvailabilityService.getCompanyAvailability as jest.Mock;
const mockSessions = sessionService.getMyCalendarSessions as jest.Mock;

describe("student calendar opened from the dashboard", () => {
  beforeEach(() => {
    mockFocus.cleanup = undefined;
    mockCalendarProps.current = null;
    mockCourse.mockResolvedValue({
      success: true,
      data: {
        program_cadence: "WEEKLY",
        cadence_anchor_date: "2026-10-04",
        enrolled_at: "2026-10-04",
        weeks_missed: 0,
        next_week_to_book: 5,
        current_week: 5,
      },
    });
    mockEvents.mockResolvedValue({ success: true, data: [] });
    mockAvailability.mockResolvedValue({ success: true, data: [] });
    mockSessions.mockResolvedValue({ success: true, data: [] });
  });

  it("opens on the requested week and ignores month changes after Android back starts", async () => {
    const view = render(<CalendarScreen />);

    await waitFor(() => {
      expect(view.getByText(/November 2026/)).toBeTruthy();
    });

    expect(mockCalendarProps.current?.enableSwipeMonths).toBe(false);
    expect(mockCalendarProps.current?.initialDate).toBe("2026-11-01");

    await act(async () => {
      mockFocus.cleanup?.();
      mockCalendarProps.current?.onMonthChange?.({ dateString: "2026-12-01" });
    });

    await waitFor(() => {
      expect(view.getByText(/November 2026/)).toBeTruthy();
    });
    expect(view.queryByText(/December 2026/)).toBeNull();

    expect(() => view.unmount()).not.toThrow();
  });
});
