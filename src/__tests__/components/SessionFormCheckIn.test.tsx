import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ sessionId: "42" }),
}));

jest.mock("react-native-safe-area-context", () => {
  const ReactLib = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("@/src/components/BackgroundGradient", () => ({ children }: { children: React.ReactNode }) => children);
jest.mock("@/src/components/InAppVideoPlayer", () => ({ InAppVideoPlayer: () => null }));

jest.mock("@/src/services/sessionService", () => ({
  sessionService: { getSessionById: jest.fn() },
}));
jest.mock("@/src/services/sessionFormService", () => ({
  sessionFormService: { getSessionWorkflow: jest.fn(), submitPretraining: jest.fn() },
}));
jest.mock("@/src/services/testSessionFormService", () => ({ testSessionFormService: {} }));
jest.mock("@/src/services/courseDrillService", () => ({ drillService: {} }));

import SessionFormScreen from "@/src/components/screens/app/SessionFormScreen";
import { sessionService } from "@/src/services/sessionService";
import { sessionFormService } from "@/src/services/sessionFormService";

const participant = (overrides: Record<string, unknown> = {}) => ({
  session_participant_id: 1,
  student_id: 7,
  student_name: "Ava Reed",
  booked_week_number: 3,
  pretraining_status: "NOT_STARTED",
  posttraining_status: "NOT_STARTED",
  current_phase: "PRE_TRAINING",
  ended_early: false,
  is_session_submitted: false,
  form: null,
  drills: [],
  ...overrides,
});

const workflow = (p: ReturnType<typeof participant>) => ({
  success: true,
  data: { session_id: 42, session_status: "SCHEDULED", participants: [p] },
});

describe("SessionFormScreen pre-training check-in", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sessionService.getSessionById as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 42, title: "Range", start_time: "2026-11-20T15:00:00Z", end_time: "2026-11-20T16:00:00Z" },
    });
    (sessionFormService.getSessionWorkflow as jest.Mock).mockResolvedValue(workflow(participant()));
  });

  it("shows a waiting state instead of the questionnaire by default", async () => {
    render(<SessionFormScreen />);
    expect(await screen.findByText("Not checked in yet", {}, { timeout: 5000 })).toBeTruthy();
    expect(screen.queryByText("Hours of Sleep")).toBeNull();
    expect(screen.getByText("Student can't check in? Answer for them")).toBeTruthy();
  });

  it("reveals the questionnaire only after the instructor confirms", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    render(<SessionFormScreen />);
    fireEvent.press(await screen.findByText("Student can't check in? Answer for them", {}, { timeout: 5000 }));

    expect(screen.queryByText("Hours of Sleep")).toBeNull();
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    act(() => buttons.find((b) => b.text === "Answer for student")!.onPress!());

    expect(screen.getByText("Hours of Sleep")).toBeTruthy();
    expect(screen.getByText("Pre-training for Ava Reed")).toBeTruthy();
  });

  it("picks up the student's check-in without a reload", async () => {
    render(<SessionFormScreen />);
    await screen.findByText("Not checked in yet", {}, { timeout: 5000 });

    (sessionFormService.getSessionWorkflow as jest.Mock).mockResolvedValue(
      workflow(participant({ pretraining_status: "COMPLETED", current_phase: "DRILLS" }))
    );
    fireEvent.press(screen.getByText("Check again"));

    await waitFor(() => expect(screen.queryByText("Not checked in yet")).toBeNull(), { timeout: 5000 });
    expect(screen.getAllByText(/Drills/).length).toBeGreaterThan(0);
  });
});
