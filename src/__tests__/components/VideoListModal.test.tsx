/**
 * Tests for VideoListModal — course materials upload: S3 vs external URL, loading state.
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
import VideoListModal from "@/src/components/VideoListModal";
import { materialService } from "@/src/services/materialService";
import { CourseView, CourseVideo } from "@/src/types/course.types";

jest.mock("@/src/services/materialService", () => ({
  materialService: {
    getVideoAccess: jest.fn(),
  },
}));

jest.mock("@/src/styles/CoursePageStyles/videoListModalStyles", () => ({
  videoListModalStyles: {
    modalContainer: {},
    modalHeader: {},
    closeButton: {},
    modalTitleSection: {},
    modalTitle: {},
    modalSubtitle: {},
    closeButtonPlaceholder: {},
    modalContent: {},
    emptyStateModal: {},
    emptyStateTitle: {},
    emptyStateText: {},
    videoItem: {},
    videoIcon: {},
    videoContent: {},
    videoTitle: {},
    videoDescription: {},
    videoMeta: {},
    videoOrder: {},
    videoWeek: {},
  },
}));

const mockGetVideoAccess = materialService.getVideoAccess as jest.MockedFunction<
  typeof materialService.getVideoAccess
>;

const baseCourse: CourseView = {
  id: 1,
  title: "Test Course",
  viewType: "instructor",
  description: "",
  required_gun_type: "Pistol",
  difficulty_level: "Beginner",
  pdf_s3_key: null,
  instructor_script_s3_key: null,
  total_weeks: 24,
  videos: [],
};

describe("VideoListModal", () => {
  const mockOnClose = jest.fn();
  let alertSpy: jest.SpyInstance;
  let linkingCanOpen: jest.SpyInstance;
  let linkingOpen: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    linkingCanOpen = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    linkingOpen = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    linkingCanOpen.mockRestore();
    linkingOpen.mockRestore();
  });

  it("renders course title and empty state when no videos", () => {
    const course: CourseView = { ...baseCourse, videos: [] };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    expect(screen.getByText("Test Course")).toBeTruthy();
    expect(screen.getByText("No Videos Available")).toBeTruthy();
    expect(screen.getByText(/No videos have been added/)).toBeTruthy();
  });

  it("renders video list with titles and order", () => {
    const videos: CourseVideo[] = [
      {
        id: 1,
        title: "Intro",
        order_index: 1,
        video_url: "https://example.com/intro.mp4",
      },
      {
        id: 2,
        title: "Week 2",
        order_index: 2,
        video_url: "https://example.com/w2.mp4",
      },
    ];
    const course: CourseView = { ...baseCourse, videos };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    expect(screen.getByText("Intro")).toBeTruthy();
    expect(screen.getByText("Week 2")).toBeTruthy();
    expect(screen.getByText("Video #1")).toBeTruthy();
    expect(screen.getByText("Video #2")).toBeTruthy();
  });

  it("opens external URL when video has only video_url (no getVideoAccess call)", async () => {
    const videos: CourseVideo[] = [
      {
        id: 10,
        title: "External Video",
        order_index: 1,
        video_url: "https://youtube.com/watch?v=abc",
      },
    ];
    const course: CourseView = { ...baseCourse, videos };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    const videoItem = screen.getByText("External Video");
    await act(async () => {
      fireEvent.press(videoItem);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockGetVideoAccess).not.toHaveBeenCalled();
    expect(linkingCanOpen).toHaveBeenCalledWith("https://youtube.com/watch?v=abc");
    expect(linkingOpen).toHaveBeenCalledWith("https://youtube.com/watch?v=abc");
  });

  it("calls getVideoAccess and opens returned URL when video has video_s3_key", async () => {
    mockGetVideoAccess.mockResolvedValue({
      success: true,
      data: {
        success: true,
        access_url: "https://s3.presigned.example/video.mp4",
        expires_at: "",
        expires_in_seconds: 3600,
        material_type: "video",
        course_title: "Test",
        course_id: 1,
      },
    });
    const videos: CourseVideo[] = [
      {
        id: 20,
        title: "S3 Video",
        order_index: 1,
        video_s3_key: "courses/1/materials/videos/abc.mp4",
      },
    ];
    const course: CourseView = { ...baseCourse, videos };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    const videoItem = screen.getByText("S3 Video");
    await act(async () => {
      fireEvent.press(videoItem);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockGetVideoAccess).toHaveBeenCalledWith(1, 20);
    expect(linkingCanOpen).toHaveBeenCalledWith("https://s3.presigned.example/video.mp4");
    expect(linkingOpen).toHaveBeenCalledWith("https://s3.presigned.example/video.mp4");
  });

  it("shows Alert when video has neither video_url nor video_s3_key", async () => {
    const videos: CourseVideo[] = [
      {
        id: 30,
        title: "Orphan Video",
        order_index: 1,
      },
    ];
    const course: CourseView = { ...baseCourse, videos };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    const videoItem = screen.getByText("Orphan Video");
    fireEvent.press(videoItem);
    await Promise.resolve();
    expect(alertSpy).toHaveBeenCalledWith("Error", "This video has no URL or file.");
    expect(linkingOpen).not.toHaveBeenCalled();
  });

  it("shows Alert when getVideoAccess fails for S3 video", async () => {
    mockGetVideoAccess.mockResolvedValue({
      success: false,
      error: "Forbidden",
    });
    const videos: CourseVideo[] = [
      {
        id: 40,
        title: "S3 Fail",
        order_index: 1,
        video_s3_key: "courses/1/materials/videos/x.mp4",
      },
    ];
    const course: CourseView = { ...baseCourse, videos };
    render(
      <VideoListModal visible course={course} onClose={mockOnClose} />
    );
    await act(async () => {
      fireEvent.press(screen.getByText("S3 Fail"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(alertSpy).toHaveBeenCalledWith("Error", "Forbidden");
    expect(linkingOpen).not.toHaveBeenCalled();
  });
});
