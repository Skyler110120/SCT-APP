import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { InAppVideoPlayer } from "@/src/components/InAppVideoPlayer";

jest.mock("expo-video", () => {
  const React = require("react");
  const { View } = require("react-native");
  const pause = jest.fn();
  return {
    useVideoPlayer: (_url: string, setup?: (player: { play: () => void; pause: () => void }) => void) => {
      const player = {
        play: jest.fn(),
        pause,
      };
      setup?.(player);
      return player;
    },
    VideoView: () => React.createElement(View, { testID: "video-view" }),
    __pause: pause,
  };
});

const { __pause: pause } = jest.requireMock("expo-video") as { __pause: jest.Mock };

describe("InAppVideoPlayer", () => {
  beforeEach(() => {
    pause.mockReset();
  });

  it("pauses once and closes when Close is pressed", () => {
    const onClose = jest.fn();
    render(
      <InAppVideoPlayer
        visible
        url="https://example.com/drill.mp4"
        title="Drill"
        onClose={onClose}
      />
    );

    fireEvent.press(screen.getByLabelText("Close video"));

    expect(pause).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("still closes when pause throws because the native player was already released", () => {
    pause.mockImplementation(() => {
      throw new Error(
        "Unable to find the native shared object associated with given JavaScript object"
      );
    });
    const onClose = jest.fn();
    render(
      <InAppVideoPlayer
        visible
        url="https://example.com/drill.mp4"
        title="Drill"
        onClose={onClose}
      />
    );

    expect(() => fireEvent.press(screen.getByLabelText("Close video"))).not.toThrow();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not pause again while the player is unmounting", () => {
    const { unmount } = render(
      <InAppVideoPlayer
        visible
        url="https://example.com/drill.mp4"
        title="Drill"
        onClose={jest.fn()}
      />
    );

    pause.mockClear();
    expect(() => unmount()).not.toThrow();
    expect(pause).not.toHaveBeenCalled();
  });
});
