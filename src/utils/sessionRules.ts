export type SessionMode = "REGULAR" | "TEST" | "RETRAIN_FREE" | "ADVANCED";

export function resolveSessionMode(
  weekNumber?: number | null,
  totalWeeks?: number | null,
  finalMonthInitialTestPassed?: boolean | null
): SessionMode {
  if (!weekNumber || weekNumber <= 0) return "REGULAR";

  const normalizedTotalWeeks = totalWeeks && totalWeeks > 0 ? totalWeeks : 24;
  const finalFourStart = Math.max(1, normalizedTotalWeeks - 3);

  if (weekNumber >= finalFourStart) {
    if (weekNumber === finalFourStart) return "TEST";
    if (weekNumber === normalizedTotalWeeks) {
      return finalMonthInitialTestPassed ? "ADVANCED" : "TEST";
    }
    return finalMonthInitialTestPassed ? "ADVANCED" : "RETRAIN_FREE";
  }

  return weekNumber % 4 === 0 ? "TEST" : "REGULAR";
}

export function isTestSessionRequired(
  weekNumber?: number | null,
  totalWeeks?: number | null,
  finalMonthInitialTestPassed?: boolean | null
): boolean {
  return (
    resolveSessionMode(weekNumber, totalWeeks, finalMonthInitialTestPassed) ===
    "TEST"
  );
}
