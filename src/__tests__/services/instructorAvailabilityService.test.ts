/**
 * Tests for instructorAvailabilityService.
 * All API calls are mocked — no network needed.
 */
import { instructorAvailabilityService } from "../../services/instructorAvailabilityService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
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

const mockAvailability = {
  id: 1,
  company_id: 5,
  instructor_id: 10,
  start_time: "09:00",
  end_time: "17:00",
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
  const createRequest = {
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
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

// ---------------------------------------------------------------------------
// updateAvailability
// ---------------------------------------------------------------------------

describe("instructorAvailabilityService.updateAvailability", () => {
  it("sends PATCH request with update data", async () => {
    const update = { start_time: "10:00", end_time: "18:00" };
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
