jest.mock("../../config", () => ({
  API_URL: "https://api.example.com",
  APP_ENV: "production",
}));

jest.mock("../../services/authStorage", () => ({
  authStorage: { getAuthToken: jest.fn() },
}));

import { authStorage } from "../../services/authStorage";
import {
  __getQueuedErrorsForTests,
  __resetErrorReporterForTests,
  flushClientErrors,
  reportClientError,
  setErrorReporterScreen,
} from "../../services/errorReporter";

describe("errorReporter", () => {
  beforeEach(() => {
    __resetErrorReporterForTests();
    (authStorage.getAuthToken as jest.Mock).mockResolvedValue("token-1");
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 202 } as Response);
  });

  afterEach(() => __resetErrorReporterForTests());

  it("tags events as coming from the mobile app", () => {
    setErrorReporterScreen("/courses");
    reportClientError({ kind: "crash", message: "boom" });

    const [event] = __getQueuedErrorsForTests();
    expect(event).toEqual(
      expect.objectContaining({
        source: "mobile",
        environment: "production",
        kind: "crash",
        message: "boom",
        screen: "/courses",
      })
    );
    expect(event.platform).toBeTruthy();
    expect(event.fingerprint).toBeTruthy();
  });

  it("drops repeats of the same error within a minute", () => {
    reportClientError({ kind: "server", message: "HTTP 500", apiPath: "/companies/9", httpStatus: 500 });
    reportClientError({ kind: "server", message: "HTTP 500", apiPath: "/companies/12", httpStatus: 500 });
    reportClientError({ kind: "server", message: "HTTP 500", apiPath: "/courses", httpStatus: 500 });

    // /companies/9 and /companies/12 group together; /courses is a different error.
    expect(__getQueuedErrorsForTests()).toHaveLength(2);
  });

  it("posts queued errors to /client-errors with the user's token", async () => {
    reportClientError({ kind: "network", message: "Network request failed" });
    await flushClientErrors();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/client-errors",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token-1" }),
      })
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.events).toHaveLength(1);
    expect(__getQueuedErrorsForTests()).toHaveLength(0);
  });

  it("never throws when the report cannot be sent", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("offline"));
    reportClientError({ kind: "network", message: "x" });
    await expect(flushClientErrors()).resolves.toBeUndefined();
  });
});
