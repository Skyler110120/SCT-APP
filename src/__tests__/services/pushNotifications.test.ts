jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("../../services/api", () => ({ apiFetch: jest.fn().mockResolvedValue(null) }));

import { routeForNotificationData } from "../../services/pushNotifications";

describe("routeForNotificationData", () => {
  it("opens the student check-in for a pre-training reminder", () => {
    expect(routeForNotificationData({ type: "session_pretraining_reminder", session_id: 42 })).toEqual({
      pathname: "/company/session-check-in",
      params: { sessionId: "42" },
    });
  });

  it("ignores other or malformed notifications", () => {
    expect(routeForNotificationData({ type: "something_else", session_id: 42 })).toBeNull();
    expect(routeForNotificationData({ type: "session_pretraining_reminder" })).toBeNull();
    expect(routeForNotificationData(null)).toBeNull();
  });
});
