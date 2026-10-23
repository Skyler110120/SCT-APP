/**
 * Tests for SessionBookingModal — the student booking confirmation modal.
 *
 *  Critical contracts:
 *   - Time slots are generated in 1-hour increments inside the instructor's
 *     declared availability window, never extending past the end_time.
 *   - The Book button is disabled until a slot is picked.
 *   - Booking a slot that has already passed (selectedDate + selectedTime in
 *     the past) shows an Alert and clears the selection.
 *   - On a successful booking, the parent's onBookingSuccess + onClose run.
 *   - On a server error containing "start_time must be in the future", a
 *     specific "no longer available" Alert is shown.
 *   - Other server errors surface the raw message in an Alert.
 *   - The "Your next class" label is hidden if course progress is unknown.
 *   - Booking-track gates mirror web: bi-weekly window, skipped-week confirm.
 */
import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen, act, waitFor } from "@testing-library/react-native";

jest.mock("@/src/services/courseService", () => ({
  courseService: {
    getMyEnrolledCourse: jest.fn(),
  },
}));

jest.mock("@/src/services/sessionService", () => ({
  sessionService: {
    bookDirectSession: jest.fn(),
    getMyCalendarSessions: jest.fn(),
  },
}));

jest.mock("@/src/services/paymentService", () => ({
  paymentService: {
    getSubscriptionStatus: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@/src/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 7, company_id: 3 } }),
}));

jest.mock("@/src/services/companyService", () => ({
  companyService: {
    getCompany: jest.fn().mockResolvedValue({
      success: true,
      data: { id: 3, booking_lock_hours: 24 },
    }),
  },
}));

jest.mock("@/src/styles/CalendarPageStyles/StudentCalendar/bookingModalStyles", () => ({
  bookingModalStyles: new Proxy({}, { get: () => ({}) }),
}));

import SessionBookingModal from "@/src/components/SessionBookingModal";
import { courseService } from "@/src/services/courseService";
import { sessionService } from "@/src/services/sessionService";

const mockGetMyEnrolledCourse =
  courseService.getMyEnrolledCourse as jest.MockedFunction<
    typeof courseService.getMyEnrolledCourse
  >;
const mockBookDirectSession =
  sessionService.bookDirectSession as jest.MockedFunction<
    typeof sessionService.bookDirectSession
  >;
const mockGetMyCalendarSessions =
  sessionService.getMyCalendarSessions as jest.MockedFunction<
    typeof sessionService.getMyCalendarSessions
  >;

/** Alert mock that accepts track confirmations ("Confirm & Book") so booking proceeds. */
const autoConfirmAlert = () =>
  jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
    buttons?.find((b) => b.text === "Confirm & Book")?.onPress?.();
  });

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const toLocalDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Sunday of the week containing d, plus `weeks` weeks, at the given weekday (0=Sun). */
const dateInWeek = (weeks: number, weekday = 3) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + weeks * 7 + weekday);
  return toLocalDateString(d);
};

const availability = {
  id: 1,
  instructor_id: 42,
  start_time: "09:00",
  end_time: "12:00", // 9, 10, 11 hour slots (3 hours -> 3 slots)
  // any other fields the component may read are not used
} as any;

async function renderModal(overrides: any = {}) {
  const onClose = jest.fn();
  const onBookingSuccess = jest.fn();
  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const dateString = `${futureDate.getFullYear()}-${String(
    futureDate.getMonth() + 1
  ).padStart(2, "0")}-${String(futureDate.getDate()).padStart(2, "0")}`;

  render(
    <SessionBookingModal
      visible
      availability={availability}
      unavailableBlocks={overrides.unavailableBlocks}
      selectedDate={overrides.selectedDate ?? dateString}
      instructorId={42}
      onClose={onClose}
      onBookingSuccess={onBookingSuccess}
    />
  );
  await flush();

  return { onClose, onBookingSuccess, dateString };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMyEnrolledCourse.mockResolvedValue({ success: true, data: null } as any);
  mockGetMyCalendarSessions.mockResolvedValue({ success: true, data: [] } as any);
});

describe("SessionBookingModal — time-slot generation", () => {
  it("generates one 1-hour slot per available hour", async () => {
    await renderModal();

    expect(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i)).toBeTruthy();
    expect(screen.getByText(/10:00\s*AM\s*-\s*11:00\s*AM/i)).toBeTruthy();
    expect(screen.getByText(/11:00\s*AM\s*-\s*12:00\s*PM/i)).toBeTruthy();
  });

  it("does not generate a slot that would extend past end_time", async () => {
    // 12:00 to 13:00 would extend past the 12:00 end_time -> excluded.
    await renderModal();
    expect(screen.queryByText(/12:00\s*PM\s*-\s*1:00\s*PM/i)).toBeNull();
  });
});

describe("SessionBookingModal — unbookable slots", () => {
  const toDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  it("marks past slots as passed and does not book them", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await renderModal({ selectedDate: toDateString(yesterday) });

    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM.*passed/i));
    fireEvent.press(screen.getByText("Book Session"));

    expect(mockBookDirectSession).not.toHaveBeenCalled();
  });

  it("marks slots inside the booking lock window as too soon to book", async () => {
    const soon = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await renderModal({ selectedDate: toDateString(soon) });

    // Every slot on a date within 24h of now is either passed or locked.
    expect(screen.queryAllByText(/too soon to book|passed/i).length).toBeGreaterThan(0);
    fireEvent.press(screen.getAllByText(/too soon to book|passed/i)[0]);
    fireEvent.press(screen.getByText("Book Session"));
    expect(mockBookDirectSession).not.toHaveBeenCalled();
  });

  it("hides slots that fall fully inside an instructor unavailable block", async () => {
    await renderModal({
      unavailableBlocks: [
        { id: 9, instructor_id: availability.instructor_id, start_time: "10:00", end_time: "11:00", status: "unavailable" },
      ],
    });

    expect(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i)).toBeTruthy();
    expect(screen.queryByText(/10:00\s*AM\s*-\s*11:00\s*AM/i)).toBeNull();
    expect(screen.getByText(/11:00\s*AM\s*-\s*12:00\s*PM/i)).toBeTruthy();
  });
});

describe("SessionBookingModal — booking", () => {
  it("calls sessionService.bookDirectSession with the chosen slot on a future date", async () => {
    mockBookDirectSession.mockResolvedValueOnce({
      success: true,
      data: { id: 99 } as any,
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { onBookingSuccess, onClose } = await renderModal();

    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    fireEvent.press(screen.getByText("Book Session"));
    await flush();

    expect(mockBookDirectSession).toHaveBeenCalledTimes(1);
    const payload = mockBookDirectSession.mock.calls[0][0];
    expect(payload.instructor_id).toBe(42);
    expect(payload.start_time).toMatch(/T09:00:00[+-]\d{2}:\d{2}$/);
    expect(payload.end_time).toMatch(/T10:00:00[+-]\d{2}:\d{2}$/);

    expect(onBookingSuccess).toHaveBeenCalledWith({ id: 99 });
    expect(onClose).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("shows a 'no longer available' Alert when the server says start_time must be in the future", async () => {
    mockBookDirectSession.mockResolvedValueOnce({
      success: false,
      error: "start_time must be in the future",
    } as any);
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    await renderModal();

    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    fireEvent.press(screen.getByText("Book Session"));
    await flush();

    expect(alertSpy).toHaveBeenCalledWith(
      "Time Not Available",
      expect.stringMatching(/no longer available/i)
    );
    alertSpy.mockRestore();
  });

  it("surfaces other server errors directly in a 'Booking Error' Alert", async () => {
    mockBookDirectSession.mockResolvedValueOnce({
      success: false,
      error: "Instructor capacity reached",
    } as any);
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    await renderModal();
    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    fireEvent.press(screen.getByText("Book Session"));
    await flush();

    expect(alertSpy).toHaveBeenCalledWith(
      "Booking Error",
      "Instructor capacity reached"
    );
    alertSpy.mockRestore();
  });
});

describe("SessionBookingModal — week picker visibility", () => {
  it("does NOT render the next-class label when getMyEnrolledCourse returns no current_week", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: null,
    } as any);

    await renderModal();
    expect(screen.queryByText("Your next class:")).toBeNull();
  });

  it("renders the next-class label when the student has a current_week", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 5, course: { title: "Pistol 101" } } as any,
    });

    await renderModal();
    expect(screen.getByText("Your next class:")).toBeTruthy();
    expect(screen.getByText("Pistol 101, Week 5")).toBeTruthy();
  });
});

describe("SessionBookingModal — week sent with booking", () => {
  async function bookFirstSlot() {
    mockBookDirectSession.mockResolvedValueOnce({ success: true, data: { id: 1 } as any });
    const alertSpy = autoConfirmAlert();
    await renderModal();
    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    fireEvent.press(screen.getByText("Book Session"));
    await flush();
    await waitFor(() => expect(mockBookDirectSession).toHaveBeenCalled());
    alertSpy.mockRestore();
    return mockBookDirectSession.mock.calls[0][0];
  }

  it("defaults to next_week_to_book when the current week is already booked", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 4, next_week_to_book: 5 } as any,
    });

    const payload = await bookFirstSlot();
    expect(payload.week_number).toBe(5);
  });

  it("falls back to current_week when next_week_to_book is missing", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 4 } as any,
    });

    const payload = await bookFirstSlot();
    expect(payload.week_number).toBe(4);
  });
});

describe("SessionBookingModal — booking track gates", () => {
  const pressFirstSlotAndBook = async () => {
    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    fireEvent.press(screen.getByText("Book Session"));
    await flush();
    await flush();
  };

  it("blocks bi-weekly bookings outside the recommended week", async () => {
    const anchor = dateInWeek(0, 0);
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 1, next_week_to_book: 2, program_cadence: "BIWEEKLY", cadence_anchor_date: anchor } as any,
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Week 2 of a bi-weekly plan is two weeks after the anchor; booking one week out is not allowed.
    await renderModal({ selectedDate: dateInWeek(1) });
    await pressFirstSlotAndBook();

    expect(alertSpy).toHaveBeenCalledWith(
      "Bi-weekly booking window",
      expect.stringMatching(/^Week 2 must be booked between /)
    );
    expect(mockBookDirectSession).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("asks before booking past an unbooked week and does not book when cancelled", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 1, next_week_to_book: 1, weeks_missed: 0, cadence_anchor_date: dateInWeek(0, 0) } as any,
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_t, _m, buttons) => {
      buttons?.find((b) => b.text === "Cancel")?.onPress?.();
    });

    await renderModal({ selectedDate: dateInWeek(2) });
    expect(screen.getByText("Missed weeks")).toBeTruthy();
    await pressFirstSlotAndBook();

    expect(alertSpy).toHaveBeenCalledWith(
      "Skipping a week",
      expect.stringContaining("2nd miss out of 4 allowable misses"),
      expect.any(Array),
      expect.any(Object)
    );
    expect(mockBookDirectSession).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
