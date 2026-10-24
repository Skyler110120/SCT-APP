export type PassOverride = "AUTO" | "PASS" | "FAIL";

export interface DrillMetricDraft {
  timeSeconds: string;
  hitCount: string;
  passOverride: PassOverride;
}

type DrillMetricSource = {
  id: number;
  time_seconds?: number | null;
  hit_count?: number | null;
  passed?: boolean | null;
  auto_passed?: boolean | null;
  pass_override_applied?: boolean;
};

type ParticipantMetricSource = {
  student_id: number;
  session_mode?: string | null;
  drills: DrillMetricSource[];
};

export function resolvePassOverride(drill: {
  passed?: boolean | null;
  auto_passed?: boolean | null;
  pass_override_applied?: boolean;
}): PassOverride {
  if (drill.passed == null) return "AUTO";
  // Explicit instructor choice, including a Pass/Fail recorded before an auto
  // result can be computed. A result that merely matches auto stays on Use auto.
  if (drill.pass_override_applied || drill.auto_passed == null) {
    return drill.passed ? "PASS" : "FAIL";
  }
  return "AUTO";
}

export function buildDrillMetricDraft(drill: {
  time_seconds?: number | null;
  hit_count?: number | null;
  passed?: boolean | null;
  auto_passed?: boolean | null;
  pass_override_applied?: boolean;
}): DrillMetricDraft {
  return {
    timeSeconds: drill.time_seconds != null ? String(drill.time_seconds) : "",
    hitCount: drill.hit_count != null ? String(drill.hit_count) : "",
    passOverride: resolvePassOverride(drill),
  };
}

export function drillMetricKey(studentId: number, drillProgressId: number): string {
  return `${studentId}:${drillProgressId}`;
}

/**
 * Seed drafts from the server, but keep selections already made in this session.
 * Marking a drill complete refreshes the whole workflow; that refresh must not
 * reset Pass/Fail or metrics the instructor already chose for other drills or students.
 */
export function mergeDrillMetricDrafts(
  previous: Map<string, DrillMetricDraft>,
  participants: ParticipantMetricSource[]
): Map<string, DrillMetricDraft> {
  const next = new Map(previous);
  for (const participant of participants) {
    if (participant.session_mode !== "TEST") continue;
    for (const drill of participant.drills) {
      const key = drillMetricKey(participant.student_id, drill.id);
      if (!next.has(key)) {
        next.set(key, buildDrillMetricDraft(drill));
      }
    }
  }
  return next;
}
