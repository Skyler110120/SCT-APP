import { isTestSessionRequired, resolveSessionMode } from "../../utils/sessionRules";

describe("sessionRules", () => {
  it("marks every 4th week as test before final month", () => {
    expect(resolveSessionMode(4, 24, false)).toBe("TEST");
    expect(resolveSessionMode(5, 24, false)).toBe("REGULAR");
    expect(isTestSessionRequired(8, 24, false)).toBe(true);
  });

  it("uses final month rules for total weeks", () => {
    expect(resolveSessionMode(21, 24, false)).toBe("TEST");
    expect(resolveSessionMode(22, 24, false)).toBe("RETRAIN_FREE");
    expect(resolveSessionMode(24, 24, false)).toBe("TEST");
  });

  it("switches final month sessions to advanced when passed", () => {
    expect(resolveSessionMode(22, 24, true)).toBe("ADVANCED");
    expect(resolveSessionMode(24, 24, true)).toBe("ADVANCED");
    expect(isTestSessionRequired(24, 24, true)).toBe(false);
  });
});
