/**
 * Tests for sessionService.
 * All API calls are mocked via jest.mock so no network is needed.
 */
import { sessionService } from "../../services/sessionService";
import { SessionStatus } from "../../types/enums";

// Mock the api module so no real HTTP calls are made
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

// Mock React Native modules that don't exist in Jest environment
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockSession = {
  id: 1,
  instructor_id: 10,
  student_id: 20,
  company_id: 5,
  title: "Training Session",
  description: "",
  start_time: "2026-03-01T10:00:00Z",
  end_time: "2026-03-01T12:00:00Z",
  status: SessionStatus.SCHEDULED,
  week_number: 3,
  created_at: "2026-02-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// bookDirectSession
// ---------------------------------------------------------------------------

describe("sessionService.bookDirectSession", () => {
  it("returns success with session data on 200", async () => {
    mockApiFetch.mockResolvedValueOnce(mockSession);

    const result = await sessionService.bookDirectSession({
      instructor_id: 10,
      title: "Training Session",
      description: "",
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockSession);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/sessions/direct-book",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns error when apiFetch throws", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await sessionService.bookDirectSession({
      instructor_id: 10,
      title: "Session",
      description: "",
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getMySessions
// ---------------------------------------------------------------------------

describe("sessionService.getMySessions", () => {
  it("returns list on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockSession]);

    const result = await sessionService.getMySessions();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].id).toBe(1);
  });

  it("includes status filter in query params when provided", async () => {
    mockApiFetch.mockResolvedValueOnce([]);

    await sessionService.getMySessions(true, false, [SessionStatus.SCHEDULED]);

    const [url] = mockApiFetch.mock.calls[0];
    expect(url).toContain("status=scheduled");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));
    const result = await sessionService.getMySessions();
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// cancelSession
// ---------------------------------------------------------------------------

describe("sessionService.cancelSession", () => {
  it("calls the cancel endpoint", async () => {
    mockApiFetch.mockResolvedValueOnce({ session: { ...mockSession, status: SessionStatus.CANCELLED } });

    await sessionService.cancelSession(1);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/sessions/1/cancel",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));
    const result = await sessionService.cancelSession(1);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// completeSession
// ---------------------------------------------------------------------------

describe("sessionService.completeSession", () => {
  it("calls the complete endpoint", async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockSession, status: SessionStatus.COMPLETED });

    const result = await sessionService.completeSession(1);

    expect(result.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/sessions/1/complete",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

// ---------------------------------------------------------------------------
// getMyCalendarSessions
// ---------------------------------------------------------------------------

describe("sessionService.getMyCalendarSessions", () => {
  it("passes start_date and end_date as query params", async () => {
    mockApiFetch.mockResolvedValueOnce([mockSession]);

    await sessionService.getMyCalendarSessions({
      start_date: "2026-03-01",
      end_date: "2026-03-31",
    });

    const [url] = mockApiFetch.mock.calls[0];
    expect(url).toContain("start_date=2026-03-01");
    expect(url).toContain("end_date=2026-03-31");
  });
});

// ---------------------------------------------------------------------------
// getSessionById
// ---------------------------------------------------------------------------

describe("sessionService.getSessionById", () => {
  it("returns session details on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockSession);

    const result = await sessionService.getSessionById(1);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockSession);
    expect(mockApiFetch).toHaveBeenCalledWith("/sessions/1");
  });

  it("returns error when session not found", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));

    const result = await sessionService.getSessionById(999);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// updateSession
// ---------------------------------------------------------------------------

describe("sessionService.updateSession", () => {
  it("sends PUT request with update data", async () => {
    const updatedSession = { ...mockSession, title: "Updated Training" };
    mockApiFetch.mockResolvedValueOnce(updatedSession);

    const result = await sessionService.updateSession(1, { title: "Updated Training" });

    expect(result.success).toBe(true);
    expect(result.data!.title).toBe("Updated Training");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/sessions/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ title: "Updated Training" }),
      })
    );
  });

  it("can update session status", async () => {
    const updatedSession = { ...mockSession, status: SessionStatus.IN_PROGRESS };
    mockApiFetch.mockResolvedValueOnce(updatedSession);

    const result = await sessionService.updateSession(1, {
      status: SessionStatus.IN_PROGRESS,
    });

    expect(result.success).toBe(true);
    expect(result.data!.status).toBe(SessionStatus.IN_PROGRESS);
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await sessionService.updateSession(1, { title: "X" });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// checkInstructorAvailability
// ---------------------------------------------------------------------------

describe("sessionService.checkInstructorAvailability", () => {
  it("returns availability result", async () => {
    const mockAvailability = { available: true, conflicts: [], message: "Free" };
    mockApiFetch.mockResolvedValueOnce(mockAvailability);

    const result = await sessionService.checkInstructorAvailability({
      instructor_id: 10,
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    expect(result.success).toBe(true);
    expect(result.data?.available).toBe(true);
  });

  it("returns conflicts when slot is taken", async () => {
    const conflictResult = {
      available: false,
      conflicts: [{ id: 5, title: "Existing session", start_time: "2026-03-01T10:00:00Z", end_time: "2026-03-01T12:00:00Z", status: "scheduled" }],
      message: "Conflict found",
    };
    mockApiFetch.mockResolvedValueOnce(conflictResult);

    const result = await sessionService.checkInstructorAvailability({
      instructor_id: 10,
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    expect(result.success).toBe(true);
    expect(result.data?.available).toBe(false);
    expect(result.data?.conflicts).toHaveLength(1);
  });

  it("passes query params correctly", async () => {
    mockApiFetch.mockResolvedValueOnce({ available: true, conflicts: [], message: "Free" });

    await sessionService.checkInstructorAvailability({
      instructor_id: 10,
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    const [url] = mockApiFetch.mock.calls[0];
    expect(url).toContain("instructor_id=10");
    expect(url).toContain("start_time=");
    expect(url).toContain("end_time=");
  });

  it("returns error on network failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await sessionService.checkInstructorAvailability({
      instructor_id: 10,
      start_time: "2026-03-01T10:00:00Z",
      end_time: "2026-03-01T12:00:00Z",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
