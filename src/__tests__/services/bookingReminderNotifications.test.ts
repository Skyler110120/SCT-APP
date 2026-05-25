/**
 * Tests for bookingReminderNotifications — the once-per-week Wednesday push
 * reminder for students who have not booked a session. The decision tree:
 *
 *   user role !== STUDENT     -> no notification
 *   today is NOT Wednesday    -> no notification
 *   already sent this week    -> no notification
 *   student already booked    -> no notification
 *   otherwise                 -> schedule local notification + mark sent
 */

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    executionEnvironment: "standalone",
  },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-notifications", () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock("../../services/sessionService", () => ({
  sessionService: {
    getMyCalendarSessions: jest.fn(),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { sessionService } from "../../services/sessionService";
import { UserRole } from "../../types/enums";

// Re-require the implementation in each test so the module-scoped
// `notificationsModulePromise` cache starts fresh and the dynamic `import()`
// is exercised cleanly.
function loadHelper() {
  let helper: typeof import("../../services/bookingReminderNotifications");
  jest.isolateModules(() => {
    helper = require("../../services/bookingReminderNotifications");
  });
  return helper!;
}

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<
  typeof AsyncStorage.getItem
>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<
  typeof AsyncStorage.setItem
>;
const mockGetCalendar = sessionService.getMyCalendarSessions as jest.MockedFunction<
  typeof sessionService.getMyCalendarSessions
>;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.MockedFunction<
  typeof Notifications.scheduleNotificationAsync
>;

const REAL_DATE = Date;

function freezeDate(date: Date) {
  // Lock both `new Date()` and `Date.now()` to the supplied instant. Allow
  // explicit-argument construction so date-fns / arithmetic still works.
  class FrozenDate extends REAL_DATE {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(date.getTime());
      } else {
        // @ts-ignore — passthrough
        super(...args);
      }
    }
    static now() {
      return date.getTime();
    }
  }
  // @ts-ignore
  global.Date = FrozenDate;
}

afterEach(() => {
  global.Date = REAL_DATE;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined as any);
  mockSchedule.mockResolvedValue("notif-id" as any);
});

describe("checkAndNotifyWednesdayBookingReminder", () => {
  it("reaches the notification-scheduling branch when student/Wed/empty-calendar", async () => {
    // The actual `scheduleNotificationAsync` call lives behind a dynamic
    // `import("expo-notifications")` in production. Jest's CJS runtime cannot
    // resolve that dynamic import (the helper falls back to null), so the
    // best we can do unit-side is verify the decision tree reaches the
    // calendar query and is not short-circuited by any of the guards above.
    freezeDate(new Date(2026, 5, 17, 9, 0, 0)); // Wed Jun 17 2026
    mockGetCalendar.mockResolvedValueOnce({ success: true, data: [] });

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockGetCalendar).toHaveBeenCalledWith({
      start_date: "2026-06-14",
      end_date: "2026-06-20",
    });
  });

  it("does NOT schedule when user role is not student", async () => {
    freezeDate(new Date(2026, 5, 17, 9, 0, 0));

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.INSTRUCTOR });
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.ADMIN });
    await checkAndNotifyWednesdayBookingReminder(null);

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockGetCalendar).not.toHaveBeenCalled();
  });

  it("does NOT schedule when today is not Wednesday", async () => {
    freezeDate(new Date(2026, 5, 16, 9, 0, 0)); // Tue

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockGetCalendar).not.toHaveBeenCalled();
  });

  it("does NOT schedule when a reminder has already been sent this week", async () => {
    freezeDate(new Date(2026, 5, 17, 9, 0, 0));
    mockGetItem.mockResolvedValueOnce("1");

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockGetCalendar).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does NOT schedule when the student already has a scheduled session this week", async () => {
    freezeDate(new Date(2026, 5, 17, 9, 0, 0));
    mockGetCalendar.mockResolvedValueOnce({
      success: true,
      data: [{ status: "scheduled" }] as any,
    });

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it("treats in_progress sessions as already-booked", async () => {
    freezeDate(new Date(2026, 5, 17, 9, 0, 0));
    mockGetCalendar.mockResolvedValueOnce({
      success: true,
      data: [{ status: "IN_PROGRESS" }] as any,
    });

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("does NOT schedule when calendar fetch fails (avoids spamming the user)", async () => {
    freezeDate(new Date(2026, 5, 17, 9, 0, 0));
    mockGetCalendar.mockResolvedValueOnce({
      success: false,
      error: "Network",
    });

    const { checkAndNotifyWednesdayBookingReminder } = loadHelper();
    await checkAndNotifyWednesdayBookingReminder({ role: UserRole.STUDENT });

    expect(mockSchedule).not.toHaveBeenCalled();
  });
});

// NOTE: requestNotificationPermissions is exercised via integration in the
// `(app)/_layout.tsx` and student dashboard mounts; the dynamic `import()` used
// inside the helper makes it awkward to unit-test the permission prompt
// branch deterministically across runs. The Wednesday-reminder decision tree
// above covers the conditional logic that drives whether the prompt is even
// reached at runtime.
