import {
  buildWeekStateMap,
  buildWeeksWithSession,
  calculateSkippedExpectedWeeks,
  getCommittedGapMissCount,
  isExpectedWeek,
  projectMissCountForBooking,
  resolveAnchorWeekStart,
  resolveRecommendedWeekStart,
  resolveTrackWeekNumber,
} from "../../utils/bookingTrack";
import type { BookingTrackContext } from "../../types/bookingTrack.types";
import type { SessionDetailed } from "../../types/sessions.types";

// Sundays in 2026: Jan 4, 11, 18, 25; Feb 1, 8, 15.
const W1 = "2026-01-04";
const W2 = "2026-01-11";
const W3 = "2026-01-18";
const W4 = "2026-01-25";
const W5 = "2026-02-01";

const context = (overrides: Partial<BookingTrackContext> = {}): BookingTrackContext => ({
  currentWeekStart: W1,
  cadence: "WEEKLY",
  anchorWeekStart: W1,
  baselineWeeksMissed: 0,
  weeksWithSession: new Set(),
  ...overrides,
});

const session = (startLocal: string, status = "scheduled") =>
  ({ id: 1, start_time: startLocal, status } as unknown as SessionDetailed);

describe("isExpectedWeek", () => {
  it("treats every week from the anchor as expected for weekly cadence", () => {
    expect(isExpectedWeek(W1, "WEEKLY", W1)).toBe(true);
    expect(isExpectedWeek(W2, "WEEKLY", W1)).toBe(true);
  });

  it("only treats every other week as expected for biweekly cadence", () => {
    expect(isExpectedWeek(W1, "BIWEEKLY", W1)).toBe(true);
    expect(isExpectedWeek(W2, "BIWEEKLY", W1)).toBe(false);
    expect(isExpectedWeek(W3, "BIWEEKLY", W1)).toBe(true);
  });

  it("never treats weeks before the anchor as expected", () => {
    expect(isExpectedWeek("2025-12-28", "WEEKLY", W1)).toBe(false);
  });
});

describe("buildWeeksWithSession", () => {
  it("groups active sessions by local Sunday week start and ignores cancelled ones", () => {
    const weeks = buildWeeksWithSession([
      session("2026-01-07T10:00:00"),
      session("2026-01-15T10:00:00", "completed"),
      session("2026-01-21T10:00:00", "cancelled"),
    ]);
    expect(Array.from(weeks).sort()).toEqual([W1, W2]);
  });
});

describe("miss projections", () => {
  it("counts skipped expected weeks between the range start and booking week", () => {
    expect(calculateSkippedExpectedWeeks(W1, W4, new Set([W2]), "WEEKLY", W1)).toEqual({
      count: 2,
      skippedWeekNumbers: [1, 3],
    });
  });

  it("ignores non-expected weeks for biweekly", () => {
    expect(calculateSkippedExpectedWeeks(W1, W5, new Set(), "BIWEEKLY", W1)).toEqual({
      count: 2,
      skippedWeekNumbers: [1, 3],
    });
  });

  it("counts gaps between already-booked weeks as committed misses", () => {
    expect(getCommittedGapMissCount(W1, W5, new Set([W1, W4]), "WEEKLY", W1)).toBe(2);
  });

  it("projects only the new misses after the last booked week", () => {
    const projection = projectMissCountForBooking(
      context({ weeksWithSession: new Set([W1]), baselineWeeksMissed: 1 }),
      W4
    );
    expect(projection.addedMissedCount).toBe(2);
    expect(projection.skippedWeekNumbers).toEqual([2, 3]);
    expect(projection.newMissedCount).toBe(3);
  });

  it("reports no added misses when booking the next week", () => {
    const projection = projectMissCountForBooking(context({ weeksWithSession: new Set([W1]) }), W2);
    expect(projection.addedMissedCount).toBe(0);
  });
});

describe("resolveRecommendedWeekStart", () => {
  it("maps next_week_to_book onto the cadence from the anchor", () => {
    expect(resolveRecommendedWeekStart(3, context())).toBe(W3);
    expect(resolveRecommendedWeekStart(2, context({ cadence: "BIWEEKLY" }))).toBe(W3);
  });

  it("never recommends a week before the current week", () => {
    expect(resolveRecommendedWeekStart(1, context({ currentWeekStart: W3 }))).toBe(W3);
  });

  it("recommends the week after the last booked week", () => {
    expect(resolveRecommendedWeekStart(1, context({ weeksWithSession: new Set([W1, W2]) }))).toBe(W3);
  });

  it("falls back to the current week without a next week", () => {
    expect(resolveRecommendedWeekStart(null, context({ currentWeekStart: W2 }))).toBe(W2);
  });
});

describe("resolveAnchorWeekStart", () => {
  it("parses a date-only anchor as a local date, not UTC", () => {
    // 2026-01-04 is a Sunday; a UTC parse would land on Saturday in US time zones.
    expect(resolveAnchorWeekStart("2026-01-04", null, W5)).toBe(W1);
    expect(resolveAnchorWeekStart("2026-01-10", null, W5)).toBe(W1);
  });

  it("falls back to enrolled_at, then the fallback week", () => {
    expect(resolveAnchorWeekStart(null, "2026-01-13T15:00:00", W5)).toBe(W2);
    expect(resolveAnchorWeekStart(null, null, W5)).toBe(W5);
  });
});

describe("buildWeekStateMap", () => {
  it("labels past, current, gap and at-risk weeks", () => {
    const ctx = context({ currentWeekStart: W2, weeksWithSession: new Set([W4]) });
    const map = buildWeekStateMap(W1, W5, ctx, W5);
    expect(map.get(W1)).toBe("pastMissed");
    expect(map.get(W2)).toBe("currentWeek");
    expect(map.get(W3)).toBe("upcomingGapMiss");
    expect(map.get(W4)).toBe("upcomingOnTrack");
    expect(map.get(W5)).toBe("upcomingAtRisk");
  });

  it("marks off-cadence weeks as not expected for biweekly", () => {
    const map = buildWeekStateMap(W1, W3, context({ cadence: "BIWEEKLY" }), W3);
    expect(map.get(W2)).toBe("notExpectedWeek");
  });
});

describe("resolveTrackWeekNumber", () => {
  it("prefers next_week_to_book, then current_week, then 1", () => {
    expect(resolveTrackWeekNumber({ next_week_to_book: 5, current_week: 3 })).toBe(5);
    expect(resolveTrackWeekNumber({ next_week_to_book: null, current_week: 3 })).toBe(3);
    expect(resolveTrackWeekNumber(null)).toBe(1);
  });
});
