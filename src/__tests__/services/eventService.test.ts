/**
 * Tests for eventService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { eventService } from "../../services/eventService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("mock-token"),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockEvent = {
  id: 1,
  company_id: 5,
  title: "Range Day",
  description: "Monthly range event",
  image: null,
  start_time: "2026-03-01T10:00:00Z",
  end_time: "2026-03-01T16:00:00Z",
  created_by_id: 2,
  created_at: "2026-02-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("eventService.getEvent", () => {
  it("returns event data on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockEvent);
    const result = await eventService.getEvent(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockEvent);
    expect(result.data?.title).toBe("Range Day");
    expect(mockApiFetch).toHaveBeenCalledWith("/events/1");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Event not found"));
    const result = await eventService.getEvent(999);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/events/999");
  });
});

describe("eventService.getEventsByCompany", () => {
  it("returns events list on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockEvent]);
    const result = await eventService.getEventsByCompany(5);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].company_id).toBe(5);
    expect(mockApiFetch).toHaveBeenCalledWith("/events/company/5");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Company not found"));
    const result = await eventService.getEventsByCompany(5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/events/company/5");
  });
});

describe("eventService.getEventsByCompanyAndTimeRange", () => {
  it("returns events within time range on success", async () => {
    mockApiFetch.mockResolvedValueOnce([mockEvent]);
    const startTime = "2026-03-01T00:00:00Z";
    const endTime = "2026-03-31T23:59:59Z";
    const result = await eventService.getEventsByCompanyAndTimeRange(
      5,
      startTime,
      endTime
    );
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockApiFetch).toHaveBeenCalledWith(
      `/events/company/5/time?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Invalid date range"));
    const result = await eventService.getEventsByCompanyAndTimeRange(
      5,
      "2026-03-01T00:00:00Z",
      "2026-03-31T23:59:59Z"
    );
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("eventService.createEvent", () => {
  const eventData = {
    title: "New Event",
    description: "A new company event",
    start_time: "2026-04-01T09:00:00Z",
    end_time: "2026-04-01T17:00:00Z",
  };

  it("returns created event on success", async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockEvent, ...eventData });
    const result = await eventService.createEvent(eventData);
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("New Event");
    expect(mockApiFetch).toHaveBeenCalledWith("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Validation failed"));
    const result = await eventService.createEvent(eventData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  });
});

describe("eventService.updateEvent", () => {
  const updateData = {
    title: "Updated Event Title",
    description: "Updated description",
  };

  it("returns updated event on success", async () => {
    const updated = { ...mockEvent, ...updateData };
    mockApiFetch.mockResolvedValueOnce(updated);
    const result = await eventService.updateEvent(3, updateData);
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Updated Event Title");
    expect(mockApiFetch).toHaveBeenCalledWith("/events/3", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Event not found"));
    const result = await eventService.updateEvent(3, updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/events/3", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  });
});

describe("eventService.deleteEvent", () => {
  it("returns success and message on delete", async () => {
    mockApiFetch.mockResolvedValueOnce({});
    const result = await eventService.deleteEvent(2);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Event deleted successfully");
    expect(mockApiFetch).toHaveBeenCalledWith("/events/2", {
      method: "DELETE",
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Cannot delete event"));
    const result = await eventService.deleteEvent(2);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockApiFetch).toHaveBeenCalledWith("/events/2", {
      method: "DELETE",
    });
  });
});
