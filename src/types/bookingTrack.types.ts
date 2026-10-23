import type { ProgramCadence } from "./enrollment.types";

export type BookingWeekState =
  | "pastBooked"
  | "pastMissed"
  | "currentWeek"
  | "upcomingOnTrack"
  | "upcomingAtRisk"
  | "upcomingGapMiss"
  | "notExpectedWeek";

export interface BookingTrackContext {
  currentWeekStart: string;
  cadence: ProgramCadence;
  anchorWeekStart: string;
  baselineWeeksMissed: number;
  weeksWithSession: Set<string>;
}

export interface BookingMissProjection {
  incrementalRangeStart: string;
  skippedWeekNumbers: number[];
  addedMissedCount: number;
  committedGapMisses: number;
  newMissedCount: number;
}
