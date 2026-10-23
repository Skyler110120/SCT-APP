/**
 * Tests for instructorAvailabilityService.
 * All API calls are mocked — no network needed.
 */
import { instructorAvailabilityService } from "../../services/instructorAvailabilityService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    detail?: string;
    body?: unknown;
    constructor(status: number, message: string, detail?: string, body?: unknown) {
      super(message);
      this.status = status;
      this.detail = detail;
      this.body = body;
    }
  },
}));

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

/** Sessions are fixed 2-hour slots; availability end_time = start_time + 2h */
const mockAvailability = {
  id: 1,
  company_id: 5,
  instructor_id: 10,
  start_time: "09:00",
  end_time: "11:00",
  day_of_week: 1,
  status: "available",
  start_date: "2026-03-01",
  end_date: "2026-06-30",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getMyAvailability
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.getMyAvailability", () => {
  it("returns list of availabilities on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockAvailability]);

    const result = await instructorAvailabilityService.getMyAvailability();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].id).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/availability/me");
  });

  it("returns empty list when instructor has no availability", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    const result = await instructorAvailabilityService.getMyAvailability();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it("returns error on API failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await instructorAvailabilityService.getMyAvailability();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getAvailabilityForCalendar
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.getAvailabilityForCalendar", () => {
  it("passes instructor_id, start_date, end_date as query params", async () => {
    mockApiFetch.mockResolvedValueOnce([mockAvailability]);

    const result = await instructorAvailabilityService.getAvailabilityForCalendar(
      10,
      "2026-03-01",
      "2026-03-31"
    );

    expect(result.success).toBe(true);
    const [url] = mockApiFetch.mock.calls[0];
    expect(url).toContain("/availability/instructor/10/calendar");
    expect(url).toContain("start_date=2026-03-01");
    expect(url).toContain("end_date=2026-03-31");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await instructorAvailabilityService.getAvailabilityForCalendar(10, "2026-03-01", "2026-03-31");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createAvailability
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.createAvailability", () => {
  /** UI sends start_time + end_time (start + 2h); sessions are fixed 2-hour slots */
  const createRequest = {
    day_of_week: 1,
    start_time: "09:00",
    end_time: "11:00",
    start_date: "2026-03-01",
    end_date: "2026-06-30",
  };

  it("sends POST request and returns created availability", async () => {
    mockApiFetch.mockResolvedValueOnce(mockAvailability);

    const result = await instructorAvailabilityService.createAvailability(createRequest);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAvailability);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/availability",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(createRequest),
      })
    );
  });

  it("creates availability without optional end_date", async () => {
    const noEndDate = { ...createRequest, end_date: undefined };
    mockApiFetch.mockResolvedValueOnce({ ...mockAvailability, end_date: null });

    const result = await instructorAvailabilityService.createAvailability(noEndDate);

    expect(result.success).toBe(true);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await instructorAvailabilityService.createAvailability(createRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("instructorAvailabilityService.createAvailabilityAsAdmin", () => {
  const adminCreateRequest = {
    instructor_id: 10,
    day_of_week: 1,
    start_time: "09:00",
    end_time: "11:00",
    start_date: "2026-03-01",
  };

  it("sends POST /availability/admin and returns created availability", async () => {
    mockApiFetch.mockResolvedValueOnce(mockAvailability);

    const result =
      await instructorAvailabilityService.createAvailabilityAsAdmin(
        adminCreateRequest
      );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAvailability);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/availability/admin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(adminCreateRequest),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("forbidden"));

    const result =
      await instructorAvailabilityService.createAvailabilityAsAdmin(
        adminCreateRequest
      );

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateAvailability
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.updateAvailability", () => {
  it("sends PATCH request with update data (end_time = start_time + 2h)", async () => {
    const update = { start_time: "10:00", end_time: "12:00" };
    mockApiFetch.mockResolvedValueOnce({ ...mockAvailability, ...update });

    const result = await instructorAvailabilityService.updateAvailability(1, update);

    expect(result.success).toBe(true);
    expect(result.data!.start_time).toBe("10:00");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/availability/1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(update),
      })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await instructorAvailabilityService.updateAvailability(1, { start_time: "10:00" });

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyAvailability (TASK-ONB-004 — students see all instructors)
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.getCompanyAvailability", () => {
  it("passes start_date and end_date as query params", async () => {
    mockApiFetch.mockResolvedValueOnce([mockAvailability]);

    const result = await instructorAvailabilityService.getCompanyAvailability(
      "2026-03-01",
      "2026-03-31"
    );

    expect(result.success).toBe(true);
    const [url] = mockApiFetch.mock.calls[0];
    expect(url).toContain("/availability/company/all");
    expect(url).toContain("start_date=2026-03-01");
    expect(url).toContain("end_date=2026-03-31");
  });

  it("returns multiple instructor availabilities", async () => {
    const instructor2Availability = { ...mockAvailability, id: 2, instructor_id: 11 };
    mockApiFetch.mockResolvedValueOnce([mockAvailability, instructor2Availability]);

    const result = await instructorAvailabilityService.getCompanyAvailability("2026-03-01", "2026-03-31");

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await instructorAvailabilityService.getCompanyAvailability("2026-03-01", "2026-03-31");

    expect(result.success).toBe(false);
  });
});

describe("instructorAvailabilityService.getInstructorAvailabilityForAdmin", () => {
  it("calls admin instructor availability endpoint", async () => {
    mockApiFetch.mockResolvedValueOnce([mockAvailability]);

    const result =
      await instructorAvailabilityService.getInstructorAvailabilityForAdmin(10);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/availability/admin/instructor/10"
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("forbidden"));

    const result =
      await instructorAvailabilityService.getInstructorAvailabilityForAdmin(10);

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteAvailability
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.deleteAvailability", () => {
  it("sends DELETE request to correct endpoint", async () => {
    mockApiFetch.mockResolvedValueOnce(undefined);

    const result = await instructorAvailabilityService.deleteAvailability(1);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/availability/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await instructorAvailabilityService.deleteAvailability(1);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// applyTimeOff
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.applyTimeOff", () => {
  it("posts only the fields that are set", async () => {
    mockApiFetch.mockResolvedValueOnce({ unavailable_rows_created: 1, cancelled_session_ids: [] });

    const result = await instructorAvailabilityService.applyTimeOff({
      scope: "whole_day",
      start_date: "2026-10-20",
      cancel_affected_sessions: false,
    });

    expect(result).toEqual({
      success: true,
      data: { unavailable_rows_created: 1, cancelled_session_ids: [] },
    });
    const [path, init] = mockApiFetch.mock.calls[0];
    expect(path).toBe("/availability/time-off");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      scope: "whole_day",
      start_date: "2026-10-20",
      cancel_affected_sessions: false,
    });
  });

  it("includes instructor_id and slot times for admin slot requests", async () => {
    mockApiFetch.mockResolvedValueOnce({ unavailable_rows_created: 1, cancelled_session_ids: [] });

    await instructorAvailabilityService.applyTimeOff({
      scope: "slot",
      start_date: "2026-10-20",
      start_time: "09:00:00",
      end_time: "10:00:00",
      instructor_id: 7,
      cancel_affected_sessions: true,
    });

    const [, init] = mockApiFetch.mock.calls[0];
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      scope: "slot",
      start_date: "2026-10-20",
      start_time: "09:00:00",
      end_time: "10:00:00",
      instructor_id: 7,
      cancel_affected_sessions: true,
    });
  });

  it("returns the structured conflict for 409 scheduled-session errors", async () => {
    const { ApiError } = jest.requireMock("../../services/api");
    const detail = {
      code: "TIME_OFF_HAS_SCHEDULED_SESSIONS",
      message: "Sessions are booked",
      sessions: [
        { id: 3, start_time: "2026-10-20T14:00:00Z", end_time: "2026-10-20T15:00:00Z", title: "Week 2", status: "scheduled" },
      ],
    };
    mockApiFetch.mockRejectedValueOnce(new ApiError(409, detail.message, detail.message, { detail }));

    const result = await instructorAvailabilityService.applyTimeOff({
      scope: "whole_day",
      start_date: "2026-10-20",
      cancel_affected_sessions: false,
    });

    expect(result).toEqual({ success: false, conflict: detail });
  });

  it("returns an error message for other failures", async () => {
    const { ApiError } = jest.requireMock("../../services/api");
    mockApiFetch.mockRejectedValueOnce(new ApiError(403, "You do not have permission to manage your time off"));

    const result = await instructorAvailabilityService.applyTimeOff({
      scope: "whole_day",
      start_date: "2026-10-20",
      cancel_affected_sessions: false,
    });

    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBeTruthy();
  });
});
