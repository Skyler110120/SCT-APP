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
