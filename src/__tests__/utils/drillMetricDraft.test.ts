import {
  buildDrillMetricDraft,
  mergeDrillMetricDrafts,
  type DrillMetricDraft,
} from "../../utils/drillMetricDraft";

const drill = (
  id: number,
  overrides: {
    time_seconds?: number | null;
    hit_count?: number | null;
    passed?: boolean | null;
    auto_passed?: boolean | null;
    pass_override_applied?: boolean;
  } = {}
) => ({
  id,
  time_seconds: null,
  hit_count: null,
  passed: null,
  auto_passed: null,
  pass_override_applied: false,
  ...overrides,
});

describe("buildDrillMetricDraft", () => {
  it("restores an explicit pass or fail even when it matches the auto result", () => {
    expect(
      buildDrillMetricDraft(
        drill(1, { passed: true, auto_passed: true, pass_override_applied: true })
      ).passOverride
    ).toBe("PASS");
    expect(
      buildDrillMetricDraft(
        drill(1, { passed: false, auto_passed: false, pass_override_applied: true })
      ).passOverride
    ).toBe("FAIL");
  });

  it("keeps Use auto when the stored result came from auto scoring", () => {
    expect(
      buildDrillMetricDraft(
        drill(1, { passed: true, auto_passed: true, pass_override_applied: false })
      ).passOverride
    ).toBe("AUTO");
  });

  it("restores a pass or fail chosen before auto scoring is possible", () => {
    expect(
      buildDrillMetricDraft(drill(1, { passed: false, auto_passed: null })).passOverride
    ).toBe("FAIL");
  });
});

describe("mergeDrillMetricDrafts", () => {
  it("keeps pass, fail, and metrics already chosen when another drill is marked complete", () => {
    const previous = new Map<string, DrillMetricDraft>([
      ["10:1", { timeSeconds: "8.5", hitCount: "5", passOverride: "PASS" }],
      ["10:2", { timeSeconds: "", hitCount: "2", passOverride: "FAIL" }],
      ["11:1", { timeSeconds: "12", hitCount: "", passOverride: "PASS" }],
    ]);

    const merged = mergeDrillMetricDrafts(previous, [
      {
        student_id: 10,
        session_mode: "TEST",
        drills: [
          drill(1, { passed: null, auto_passed: null }),
          drill(2),
          drill(3, { time_seconds: 4, hit_count: 1, passed: true, auto_passed: false, pass_override_applied: true }),
        ],
      },
      {
        student_id: 11,
        session_mode: "TEST",
        drills: [drill(1, { passed: null })],
      },
    ]);

    expect(merged.get("10:1")).toEqual({
      timeSeconds: "8.5",
      hitCount: "5",
      passOverride: "PASS",
    });
    expect(merged.get("10:2")?.passOverride).toBe("FAIL");
    expect(merged.get("11:1")?.passOverride).toBe("PASS");
    expect(merged.get("10:3")).toEqual({
      timeSeconds: "4",
      hitCount: "1",
      passOverride: "PASS",
    });
  });
});
