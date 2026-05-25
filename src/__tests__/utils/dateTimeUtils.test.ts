/**
 * Tests for dateTimeUtils helpers.
 * Pure functions — no mocks needed.
 */
import {
  formatTimeString,
  formatDateString,
  formatDateRange,
  formatDateForAPI,
  formatISOTime,
  getDayName,
  createLocalDate,
  toLocalISOString,
  getWeekBounds,
  isWednesday,
} from "../../utils/dateTimeUtils";

// ---------------------------------------------------------------------------
// formatTimeString
// ---------------------------------------------------------------------------

describe("formatTimeString", () => {
  it("formats HH:MM string to 12-hour time", () => {
    const result = formatTimeString("14:30");
    expect(result).toMatch(/2:30/);
    expect(result).toMatch(/PM/i);
  });

  it("formats midnight (00:00) correctly", () => {
    const result = formatTimeString("00:00");
    expect(result).toMatch(/12:00/);
    expect(result).toMatch(/AM/i);
  });

  it("formats noon (12:00) correctly", () => {
    const result = formatTimeString("12:00");
    expect(result).toMatch(/12:00/);
    expect(result).toMatch(/PM/i);
  });

  it("returns 'Invalid time' for empty string", () => {
    expect(formatTimeString("")).toBe("Invalid time");
  });

  it("returns 'Invalid time' for garbage input", () => {
    expect(formatTimeString("not-a-time")).toBe("Invalid time");
  });

  it("handles ISO datetime strings", () => {
    const result = formatTimeString("2026-01-15T09:00:00.000Z");
    // The exact output depends on the TZ of the test runner, but it should be valid
    expect(result).not.toBe("Invalid time");
  });

  it("returns 'Invalid time' for invalid ISO", () => {
    expect(formatTimeString("not-iso-T-invalid")).toBe("Invalid time");
  });
});

// ---------------------------------------------------------------------------
// formatDateString
// ---------------------------------------------------------------------------

describe("formatDateString", () => {
  it("formats YYYY-MM-DD correctly", () => {
    const result = formatDateString("2026-03-15");
    expect(result).not.toBe("Invalid date");
    expect(result).toContain("03");
    expect(result).toContain("15");
  });

  it("accepts a Date object", () => {
    const d = new Date(2026, 2, 15); // March 15 2026
    const result = formatDateString(d);
    expect(result).not.toBe("Invalid date");
  });

  it("returns 'Invalid date' for empty string", () => {
    expect(formatDateString("")).toBe("Invalid date");
  });

  it("returns 'Invalid date' for garbage input", () => {
    expect(formatDateString("not-a-date")).toBe("Invalid date");
  });
});

// ---------------------------------------------------------------------------
// formatDateRange
// ---------------------------------------------------------------------------

describe("formatDateRange", () => {
  it("shows 'Starting ...' when no end date", () => {
    const result = formatDateRange("2026-01-01");
    expect(result).toMatch(/Starting/i);
  });

  it("shows range when both dates provided", () => {
    const result = formatDateRange("2026-01-01", "2026-06-30");
    expect(result).toContain(" - ");
  });
});

// ---------------------------------------------------------------------------
// formatDateForAPI
// ---------------------------------------------------------------------------

describe("formatDateForAPI", () => {
  it("formats a Date to YYYY-MM-DD", () => {
    const d = new Date(2026, 0, 5); // Jan 5 2026
    expect(formatDateForAPI(d)).toBe("2026-01-05");
  });

  it("zero-pads month and day", () => {
    const d = new Date(2026, 8, 3); // Sep 3 2026
    expect(formatDateForAPI(d)).toBe("2026-09-03");
  });

  it("returns empty string for invalid date", () => {
    expect(formatDateForAPI(new Date("not-a-date"))).toBe("");
  });
});

// ---------------------------------------------------------------------------
// formatISOTime
// ---------------------------------------------------------------------------

describe("formatISOTime", () => {
  it("formats a valid ISO string to time", () => {
    const result = formatISOTime("2026-03-15T14:30:00.000Z");
    expect(result).not.toBe("Invalid time");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns 'Invalid time' for empty string", () => {
    expect(formatISOTime("")).toBe("Invalid time");
  });

  it("returns 'Invalid time' for garbage input", () => {
    expect(formatISOTime("not-an-iso")).toBe("Invalid time");
  });

  it("handles midnight ISO correctly", () => {
    const result = formatISOTime("2026-01-01T00:00:00.000Z");
    expect(result).not.toBe("Invalid time");
  });
});

// ---------------------------------------------------------------------------
// getDayName
// ---------------------------------------------------------------------------

describe("getDayName", () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  days.forEach((name, index) => {
    it(`returns ${name} for index ${index}`, () => {
      expect(getDayName(index)).toBe(name);
    });
  });

  it("returns 'Invalid day' for out-of-range index", () => {
    expect(getDayName(7)).toBe("Invalid day");
    expect(getDayName(-1)).toBe("Invalid day");
  });
});

// ---------------------------------------------------------------------------
// createLocalDate
// ---------------------------------------------------------------------------

describe("createLocalDate", () => {
  it("creates a Date from YYYY-MM-DD without UTC offset issues", () => {
    const d = createLocalDate("2026-06-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);   // 0-indexed
    expect(d.getDate()).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// toLocalISOString — the backbone of booking-slot payloads. The API validates
// against instructor availability in local time, so the serialized string must
// reflect the device's local clock + offset, not UTC.
// ---------------------------------------------------------------------------

describe("toLocalISOString", () => {
  it("serializes a local Date with offset suffix (not UTC)", () => {
    const d = new Date(2026, 2, 5, 9, 0, 0); // March 5 2026 09:00 local
    const iso = toLocalISOString(d);

    expect(iso).toMatch(/^2026-03-05T09:00:00[+-]\d{2}:\d{2}$/);
  });

  it("zero-pads month, day, hour, minute, and second", () => {
    const d = new Date(2026, 0, 1, 3, 7, 2); // Jan 1 03:07:02
    const iso = toLocalISOString(d);

    expect(iso.startsWith("2026-01-01T03:07:02")).toBe(true);
  });

  it("formats offset with leading + when offset is non-negative", () => {
    // Mock the timezone offset to be UTC+5 (-300 in JS terms).
    const d = new Date(2026, 0, 1, 12, 0, 0);
    jest.spyOn(d, "getTimezoneOffset").mockReturnValue(-300);

    expect(toLocalISOString(d)).toMatch(/\+05:00$/);
  });

  it("formats offset with leading - when behind UTC", () => {
    const d = new Date(2026, 0, 1, 12, 0, 0);
    jest.spyOn(d, "getTimezoneOffset").mockReturnValue(300);

    expect(toLocalISOString(d)).toMatch(/-05:00$/);
  });
});

// ---------------------------------------------------------------------------
// getWeekBounds — used by the weekly-availability and reminder flows. Week is
// Sunday–Saturday.
// ---------------------------------------------------------------------------

describe("getWeekBounds", () => {
  it("returns Sunday..Saturday containing a Wednesday", () => {
    const wed = new Date(2026, 5, 17); // Wednesday Jun 17 2026
    const { startDate, endDate } = getWeekBounds(wed);

    expect(startDate).toBe("2026-06-14"); // Sunday
    expect(endDate).toBe("2026-06-20");   // Saturday
  });

  it("returns Sunday..Saturday when input is the Sunday itself", () => {
    const sun = new Date(2026, 5, 14);
    const { startDate, endDate } = getWeekBounds(sun);

    expect(startDate).toBe("2026-06-14");
    expect(endDate).toBe("2026-06-20");
  });

  it("returns Sunday..Saturday when input is the Saturday", () => {
    const sat = new Date(2026, 5, 20);
    const { startDate, endDate } = getWeekBounds(sat);

    expect(startDate).toBe("2026-06-14");
    expect(endDate).toBe("2026-06-20");
  });

  it("handles month boundaries", () => {
    // Tuesday Sep 1 2026 — week starts in August.
    const d = new Date(2026, 8, 1);
    const { startDate, endDate } = getWeekBounds(d);

    expect(startDate).toBe("2026-08-30");
    expect(endDate).toBe("2026-09-05");
  });
});

// ---------------------------------------------------------------------------
// isWednesday — controls the booking-reminder cadence.
// ---------------------------------------------------------------------------

describe("isWednesday", () => {
  it("returns true only when day-of-week is Wednesday", () => {
    expect(isWednesday(new Date(2026, 5, 17))).toBe(true);  // Wed
    expect(isWednesday(new Date(2026, 5, 16))).toBe(false); // Tue
    expect(isWednesday(new Date(2026, 5, 18))).toBe(false); // Thu
    expect(isWednesday(new Date(2026, 5, 14))).toBe(false); // Sun
  });
});
