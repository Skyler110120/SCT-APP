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
 *   - The "Course week" picker is hidden if course progress is unknown.
 */
import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen, act } from "@testing-library/react-native";

jest.mock("@/src/services/courseService", () => ({
  courseService: {
    getMyEnrolledCourse: jest.fn(),
  },
}));

jest.mock("@/src/services/sessionService", () => ({
  sessionService: {
    bookDirectSession: jest.fn(),
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
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  return { onClose, onBookingSuccess, dateString };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMyEnrolledCourse.mockResolvedValue({ success: true, data: null } as any);
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
    await act(async () => {
      fireEvent.press(screen.getByText("Book Session"));
      await Promise.resolve();
      await Promise.resolve();
    });

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
    await act(async () => {
      fireEvent.press(screen.getByText("Book Session"));
      await Promise.resolve();
      await Promise.resolve();
    });

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
    await act(async () => {
      fireEvent.press(screen.getByText("Book Session"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Booking Error",
      "Instructor capacity reached"
    );
    alertSpy.mockRestore();
  });
});

describe("SessionBookingModal — week picker visibility", () => {
  it("does NOT render the week picker when getMyEnrolledCourse returns no current_week", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: null,
    } as any);

    await renderModal();
    expect(screen.queryByText("Course week:")).toBeNull();
  });

  it("renders the week picker when the student has a current_week", async () => {
    mockGetMyEnrolledCourse.mockResolvedValueOnce({
      success: true,
      data: { current_week: 5 } as any,
    });

    await renderModal();
    expect(screen.getByText("Course week:")).toBeTruthy();
  });
});

describe("SessionBookingModal — week sent with booking", () => {
  async function bookFirstSlot() {
    mockBookDirectSession.mockResolvedValueOnce({ success: true, data: { id: 1 } as any });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await renderModal();
    fireEvent.press(screen.getByText(/9:00\s*AM\s*-\s*10:00\s*AM/i));
    await act(async () => {
      fireEvent.press(screen.getByText("Book Session"));
      await Promise.resolve();
      await Promise.resolve();
    });
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
