import type { BookingMissProjection, BookingTrackContext, BookingWeekState } from "../types/bookingTrack.types";
import type { ProgramCadence } from "../types/enrollment.types";
import type { SessionDetailed } from "../types/sessions.types";
import { addDays, getWeekStartFromISODate } from "./dateTimeUtils";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_COURSE_WEEKS = 24;

const toTime = (weekStart: string): number => new Date(weekStart).getTime();

export const isActiveSessionStatus = (status?: string | null): boolean => {
  const normalized = status?.toLowerCase();
  return normalized === "scheduled" || normalized === "in_progress" || normalized === "completed";
};

export const buildWeeksWithSession = (sessions: SessionDetailed[]): Set<string> => {
  const weeks = new Set<string>();
  sessions.filter((s) => isActiveSessionStatus(s.status)).forEach((s) => {
    if (s.start_time) weeks.add(getWeekStartFromISODate(s.start_time));
  });
  return weeks;
};

const expectedWeekIndex = (weekStart: string, anchorWeekStart: string): number =>
  Math.round((toTime(weekStart) - toTime(anchorWeekStart)) / WEEK_MS);

export const isExpectedWeek = (
  weekStart: string,
  cadence: ProgramCadence,
  anchorWeekStart: string,
): boolean => {
  const diffWeeks = expectedWeekIndex(weekStart, anchorWeekStart);
  if (diffWeeks < 0) return false;
  return cadence === "WEEKLY" || diffWeeks % 2 === 0;
};

const sortedWeeks = (weeks: Set<string>): string[] => Array.from(weeks).sort();

export const getIncrementalMissRangeStart = (
  currentWeekStart: string,
  bookingWeekStart: string,
  weeksWithSession: Set<string>,
): string => {
  const priorWeeksWithSession = sortedWeeks(weeksWithSession).filter(
    (weekStart) => weekStart >= currentWeekStart && weekStart < bookingWeekStart,
  );
  if (priorWeeksWithSession.length === 0) return currentWeekStart;
  return addDays(priorWeeksWithSession[priorWeeksWithSession.length - 1], 7);
};

export const calculateSkippedExpectedWeeks = (
  rangeStartWeek: string,
  bookingWeekStart: string,
  weeksWithSession: Set<string>,
  cadence: ProgramCadence,
  anchorWeekStart: string,
): { count: number; skippedWeekNumbers: number[] } => {
  const skippedWeekNumbers: number[] = [];
  for (
    let weekStart = rangeStartWeek;
    weekStart < bookingWeekStart;
    weekStart = addDays(weekStart, 7)
  ) {
    if (!isExpectedWeek(weekStart, cadence, anchorWeekStart)) continue;
    if (weeksWithSession.has(weekStart)) continue;
    skippedWeekNumbers.push(expectedWeekIndex(weekStart, anchorWeekStart) + 1);
  }
  return { count: skippedWeekNumbers.length, skippedWeekNumbers };
};

export const getCommittedGapMissCount = (
  currentWeekStart: string,
  bookingWeekStart: string,
  weeksWithSession: Set<string>,
  cadence: ProgramCadence,
  anchorWeekStart: string,
): number => {
  const priorWeeksWithSession = sortedWeeks(weeksWithSession).filter(
    (weekStart) => weekStart >= currentWeekStart && weekStart < bookingWeekStart,
  );
  if (priorWeeksWithSession.length < 2) return 0;

  let committedGapMisses = 0;
  for (let i = 1; i < priorWeeksWithSession.length; i += 1) {
    const prevBookedWeek = priorWeeksWithSession[i - 1];
    const nextBookedWeek = priorWeeksWithSession[i];
    for (
      let weekStart = addDays(prevBookedWeek, 7);
      weekStart < nextBookedWeek;
      weekStart = addDays(weekStart, 7)
    ) {
      if (isExpectedWeek(weekStart, cadence, anchorWeekStart)) committedGapMisses += 1;
    }
  }
  return committedGapMisses;
};

export const projectMissCountForBooking = (
  context: BookingTrackContext,
  bookingWeekStart: string,
): BookingMissProjection => {
  const incrementalRangeStart = getIncrementalMissRangeStart(
    context.currentWeekStart,
    bookingWeekStart,
    context.weeksWithSession,
  );
  const { count: addedMissedCount, skippedWeekNumbers } = calculateSkippedExpectedWeeks(
    incrementalRangeStart,
    bookingWeekStart,
    context.weeksWithSession,
    context.cadence,
    context.anchorWeekStart,
  );
  const committedGapMisses = getCommittedGapMissCount(
    context.currentWeekStart,
    bookingWeekStart,
    context.weeksWithSession,
    context.cadence,
    context.anchorWeekStart,
  );
  return {
    incrementalRangeStart,
    skippedWeekNumbers,
    addedMissedCount,
    committedGapMisses,
    newMissedCount: context.baselineWeeksMissed + committedGapMisses + addedMissedCount,
  };
};

export const resolveRecommendedWeekStart = (
  nextWeekToBook: number | null | undefined,
  context: BookingTrackContext,
): string => {
  if (!nextWeekToBook || nextWeekToBook < 1) return context.currentWeekStart;
  const intervalDays = context.cadence === "BIWEEKLY" ? 14 : 7;
  const suggested = addDays(context.anchorWeekStart, (nextWeekToBook - 1) * intervalDays);
  let candidate = suggested < context.currentWeekStart ? context.currentWeekStart : suggested;
  const bookedWeeks = sortedWeeks(context.weeksWithSession).filter(
    (weekStart) =>
      weekStart >= context.currentWeekStart &&
      isExpectedWeek(weekStart, context.cadence, context.anchorWeekStart),
  );
  if (bookedWeeks.length > 0) {
    // Avoid recommending a gap week when later classes are already booked.
    candidate = addDays(bookedWeeks[bookedWeeks.length - 1], 7);
  }
  const lastCourseWeekStart = addDays(
    context.anchorWeekStart,
    (DEFAULT_MAX_COURSE_WEEKS - 1) * intervalDays,
  );
  if (candidate > lastCourseWeekStart) return lastCourseWeekStart;

  for (let i = 0; i < 260; i += 1) {
    if (candidate > lastCourseWeekStart) return lastCourseWeekStart;
    if (
      isExpectedWeek(candidate, context.cadence, context.anchorWeekStart) &&
      !context.weeksWithSession.has(candidate)
    ) {
      return candidate;
    }
    candidate = addDays(candidate, 7);
  }
  return candidate;
};

export const resolveAnchorWeekStart = (
  cadenceAnchorDate: string | null | undefined,
  enrolledAt: string | null | undefined,
  fallbackWeekStart: string,
): string => {
  if (cadenceAnchorDate) return getWeekStartFromISODate(cadenceAnchorDate);
  if (enrolledAt) return getWeekStartFromISODate(enrolledAt);
  return fallbackWeekStart;
};

export const buildWeekStateMap = (
  rangeStartWeek: string,
  rangeEndWeek: string,
  context: BookingTrackContext,
  recommendedWeekStart: string,
): Map<string, BookingWeekState> => {
  const result = new Map<string, BookingWeekState>();
  const bookedWeeks = sortedWeeks(context.weeksWithSession);
  for (let weekStart = rangeStartWeek; weekStart <= rangeEndWeek; weekStart = addDays(weekStart, 7)) {
    if (!isExpectedWeek(weekStart, context.cadence, context.anchorWeekStart)) {
      result.set(weekStart, "notExpectedWeek");
      continue;
    }
    if (weekStart === context.currentWeekStart) {
      result.set(weekStart, "currentWeek");
      continue;
    }
    if (weekStart < context.currentWeekStart) {
      result.set(weekStart, context.weeksWithSession.has(weekStart) ? "pastBooked" : "pastMissed");
      continue;
    }
    if (context.weeksWithSession.has(weekStart)) {
      result.set(weekStart, "upcomingOnTrack");
      continue;
    }
    const hasLaterBookedWeek = bookedWeeks.some(
      (bookedWeek) => bookedWeek > weekStart && bookedWeek <= rangeEndWeek,
    );
    if (hasLaterBookedWeek) {
      result.set(weekStart, "upcomingGapMiss");
    } else if (weekStart === recommendedWeekStart) {
      result.set(weekStart, "upcomingAtRisk");
    } else {
      result.set(weekStart, "upcomingOnTrack");
    }
  }
  return result;
};

/** The program week number shown to the student: next week to book, else current week. */
export const resolveTrackWeekNumber = (
  enrollment: { next_week_to_book?: number | null; current_week?: number | null } | null | undefined,
): number => enrollment?.next_week_to_book ?? enrollment?.current_week ?? 1;
