/**
 * Tests for globalErrorBus — pub/sub used by api.ts + GlobalErrorReporter.
 *
 * The reporter relies on the bus to deliver every emitted error to every
 * subscribed listener with sane defaults (severity, timestamp, kind).
 */
import {
  emitGlobalError,
  subscribeGlobalError,
  GlobalErrorEvent,
} from "../../utils/globalErrorBus";

describe("globalErrorBus", () => {
  it("delivers emitted events to all subscribed listeners", () => {
    const a = jest.fn();
    const b = jest.fn();
    const unsubA = subscribeGlobalError(a);
    const unsubB = subscribeGlobalError(b);

    emitGlobalError({ message: "boom" });

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    const eventA = a.mock.calls[0][0] as GlobalErrorEvent;
    expect(eventA.message).toBe("boom");
    expect(eventA.severity).toBe("error");
    expect(eventA.kind).toBe("unknown");
    expect(typeof eventA.timestamp).toBe("number");

    unsubA();
    unsubB();
  });

  it("stops delivering after unsubscribe", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeGlobalError(listener);

    emitGlobalError({ message: "first" });
    unsubscribe();
    emitGlobalError({ message: "second" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as GlobalErrorEvent).message).toBe("first");
  });

  it("preserves explicit severity / kind / path / dedupe from emitter", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeGlobalError(listener);

    emitGlobalError({
      message: "401",
      severity: "warning",
      kind: "auth",
      path: "/auth/login",
      method: "POST",
      dedupeKey: "POST:/auth/login:401",
      status: 401,
    });

    const event = listener.mock.calls[0][0] as GlobalErrorEvent;
    expect(event.severity).toBe("warning");
    expect(event.kind).toBe("auth");
    expect(event.path).toBe("/auth/login");
    expect(event.dedupeKey).toBe("POST:/auth/login:401");

    unsubscribe();
  });

  it("does not invoke a listener twice if it subscribes twice via different references", () => {
    // The implementation backs the registry with a Set; subscribing the same
    // function twice should be a no-op (Set semantics).
    const listener = jest.fn();
    const u1 = subscribeGlobalError(listener);
    const u2 = subscribeGlobalError(listener);

    emitGlobalError({ message: "once" });

    expect(listener).toHaveBeenCalledTimes(1);

    u1();
    u2();
  });
});
