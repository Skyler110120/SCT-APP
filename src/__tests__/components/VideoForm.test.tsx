/**
 * Tests for VideoForm — course materials upload: source toggle (URL vs Upload), validation, submit payload, file size validation.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import VideoForm from "@/src/components/masterAdmin/VideoForm";
import { materialService } from "@/src/services/materialService";
import { CourseAdminView, CourseVideo } from "@/src/types/course.types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { MAX_VIDEO_SIZE_BYTES } from "@/src/constants/uploadLimits";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true }) }));
jest.mock("expo-file-system", () => ({ getInfoAsync: jest.fn().mockResolvedValue({ size: 1000 }) }));

jest.mock("@/src/services/materialService", () => ({
  materialService: {
    requestUploadUrl: jest.fn(),
    uploadFileToPresignedUrl: jest.fn(),
  },
}));

jest.mock("@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/videoFormStyles", () => ({
  videoFormStyles: {
    modalOverlay: {},
    modalContent: {},
    modalTitle: {},
    description: {},
    createSection: {},
    modalLabel: {},
    searchInput: {},
    warningText: {},
    inputDescription: {},
    modalPickerContainer: {},
    modalPicker: {},
    buttonContainer: {},
    cancelButton: {},
    confirmButton: {},
    buttonText: {},
    savingContainer: {},
    savingText: {},
  },
}));

const baseCourse: CourseAdminView = {
  id: 1,
  title: "Test Course",
  viewType: "admin",
  description: "",
  required_gun_type: "Handgun",
  difficulty_level: "Beginner",
  pdf_s3_key: null,
  instructor_script_s3_key: null,
  total_weeks: 24,
  is_active: true,
  order_index: 1,
  created_at: "",
  updated_at: "",
  videos: [],
};

describe("VideoForm", () => {
  const mockOnClose = jest.fn();
  const mockOnCreateVideo = jest.fn().mockResolvedValue(undefined);
  const mockOnUpdateVideo = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create mode shows Add New Video and source toggle External URL / Upload file", () => {
    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    expect(screen.getByText("Add New Video")).toBeTruthy();
    expect(screen.getByText("Course: Test Course")).toBeTruthy();
    expect(screen.getByText("External URL")).toBeTruthy();
    expect(screen.getByText("Upload file")).toBeTruthy();
    expect(screen.getByText("Add Video")).toBeTruthy();
  });

  it("shows Visible to students toggle and includes is_public in create payload", async () => {
    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    expect(screen.getByText("Visible to students")).toBeTruthy();
    expect(screen.getByText(/When on, enrolled students can view this video/)).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("Enter video title..."), "Intro");
    fireEvent.changeText(
      screen.getByPlaceholderText("https://youtube.com/watch?v=..."),
      "https://example.com/v.mp4"
    );
    fireEvent.press(screen.getByText("Add Video"));
    await Promise.resolve();
    expect(mockOnCreateVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Intro",
        video_url: "https://example.com/v.mp4",
        order_index: 1,
        is_public: false,
      })
    );
  });

  it("switching to Upload file shows upload button and no URL input", () => {
    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    fireEvent.press(screen.getByText("Upload file"));
    expect(screen.getByText("Upload video (mp4, mov)")).toBeTruthy();
    expect(screen.getByText("Or switch to External URL above")).toBeTruthy();
    expect(screen.queryByPlaceholderText("https://youtube.com/watch?v=...")).toBeNull();
  });

  it("submit with URL source calls onCreateVideo with video_url", async () => {
    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    fireEvent.changeText(screen.getByPlaceholderText("Enter video title..."), "My Video");
    fireEvent.changeText(
      screen.getByPlaceholderText("https://youtube.com/watch?v=..."),
      "https://example.com/video.mp4"
    );
    fireEvent.press(screen.getByText("Add Video"));
    await Promise.resolve();
    expect(mockOnCreateVideo).toHaveBeenCalledTimes(1);
    const payload = mockOnCreateVideo.mock.calls[0][0];
    expect(payload.title).toBe("My Video");
    expect(payload.video_url).toBe("https://example.com/video.mp4");
    expect(payload.video_s3_key).toBeUndefined();
  });

  it("submit with Upload selected but no file shows validation alert", async () => {
    const alertSpy = jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});
    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    fireEvent.press(screen.getByText("Upload file"));
    fireEvent.changeText(screen.getByPlaceholderText("Enter video title..."), "My Video");
    fireEvent.press(screen.getByText("Add Video"));
    await Promise.resolve();
    expect(mockOnCreateVideo).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Validation Error", "Please correct the errors and try again.");
    expect(screen.getByText("Please upload a video file")).toBeTruthy();
    alertSpy.mockRestore();
  });

  it("edit mode with S3 video shows Uploaded filename, Replace video, Clear", () => {
    const video: CourseVideo = {
      id: 10,
      title: "S3 Video",
      description: "",
      order_index: 1,
      video_url: null,
      video_s3_key: "courses/1/materials/videos/xyz.mp4",
      video_filename: "intro.mp4",
      video_content_type: "video/mp4",
      week_number: 1,
    };
    const courseWithVideo: CourseAdminView = {
      ...baseCourse,
      videos: [video],
    };
    render(
      <VideoForm
        visible
        video={video}
        course={courseWithVideo}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateVideo={mockOnUpdateVideo}
      />
    );
    expect(screen.getByText("Edit Video")).toBeTruthy();
    expect(screen.getByText(/Uploaded: intro\.mp4/)).toBeTruthy();
    expect(screen.getByText("Replace video")).toBeTruthy();
    expect(screen.getByText("Clear")).toBeTruthy();
    expect(screen.getByText("Update Video")).toBeTruthy();
  });

  it("edit mode submit with S3 video calls onUpdateVideo with video_s3_key", async () => {
    const video: CourseVideo = {
      id: 10,
      title: "S3 Video",
      description: "",
      order_index: 1,
      video_url: null,
      video_s3_key: "courses/1/materials/videos/xyz.mp4",
      video_filename: "intro.mp4",
      video_content_type: "video/mp4",
      week_number: 1,
    };
    const courseWithVideo: CourseAdminView = {
      ...baseCourse,
      videos: [video],
    };
    render(
      <VideoForm
        visible
        video={video}
        course={courseWithVideo}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateVideo={mockOnUpdateVideo}
      />
    );
    fireEvent.press(screen.getByText("Update Video"));
    await Promise.resolve();
    expect(mockOnUpdateVideo).toHaveBeenCalledTimes(1);
    const payload = mockOnUpdateVideo.mock.calls[0][0];
    expect(payload.video_s3_key).toBe("courses/1/materials/videos/xyz.mp4");
    expect(payload.video_filename).toBe("intro.mp4");
    expect(payload.video_url).toBeUndefined();
  });

  it("shows File too large alert and does not upload when video exceeds size limit", async () => {
    const alertSpy = jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///big.mp4", name: "big.mp4", mimeType: "video/mp4" }],
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
      size: MAX_VIDEO_SIZE_BYTES + 1,
    });

    render(
      <VideoForm
        visible
        course={baseCourse}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateVideo={mockOnCreateVideo}
      />
    );
    fireEvent.press(screen.getByText("Upload file"));
    fireEvent.press(screen.getByText("Upload video (mp4, mov)"));
    await Promise.resolve();
    await Promise.resolve();

    expect(alertSpy).toHaveBeenCalledWith("File too large", expect.stringMatching(/Video.*under.*500/));
    expect(materialService.requestUploadUrl).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
