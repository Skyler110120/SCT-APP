/**
 * Tests for CourseForm — course materials: multiple course PDFs, instructor script, file size validation.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import CourseForm from "@/src/components/masterAdmin/CourseForm";
import { materialService } from "@/src/services/materialService";
import { CourseAdminView, CourseDocument } from "@/src/types/course.types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { MAX_PDF_SCRIPT_SIZE_BYTES } from "@/src/constants/uploadLimits";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true }) }));
jest.mock("expo-file-system/legacy", () => ({ getInfoAsync: jest.fn().mockResolvedValue({ size: 1000 }) }));

jest.mock("@/src/services/materialService", () => ({
  materialService: {
    requestUploadUrl: jest.fn(),
    uploadFileToPresignedUrl: jest.fn(),
    addCourseDocument: jest.fn(),
    updateCourseDocument: jest.fn(),
    deleteCourseDocument: jest.fn(),
  },
}));

jest.mock("@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/courseFormStyles", () => ({
  courseFormStyles: {
    modalOverlay: {},
    modalContent: {},
    modalTitle: {},
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
    materialStatusContainer: {},
    materialStatusRow: {},
    materialStatusText: {},
  },
}));

const doc = (id: number, title: string, is_public = false): CourseDocument => ({
  id,
  course_id: 1,
  title,
  filename: `${title}.pdf`,
  content_type: "application/pdf",
  is_public,
  order_index: id,
});

const makeCourse = (overrides: Partial<CourseAdminView> = {}): CourseAdminView => ({
  id: 1,
  title: "Existing Course",
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
  documents: [],
  ...overrides,
});

describe("CourseForm", () => {
  const mockOnClose = jest.fn();
  const mockOnCreateCourse = jest.fn().mockResolvedValue(undefined);
  const mockOnUpdateCourse = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderEdit = (course: CourseAdminView, extra: Record<string, unknown> = {}) =>
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
        {...extra}
      />
    );

  it("in create mode shows message to save course first for PDFs and script", () => {
    render(
      <CourseForm
        visible
        course={null}
        isSubmitting={false}
        onClose={mockOnClose}
        onCreateCourse={mockOnCreateCourse}
        existingCourseCount={0}
      />
    );
    expect(screen.getByText(/Save the course first, then add PDFs/)).toBeTruthy();
    expect(screen.getByText(/Save the course first, then add the script/)).toBeTruthy();
    expect(screen.getByText("Create New Course")).toBeTruthy();
  });

  it("in edit mode with no PDFs shows Add PDFs and Upload instructor script", () => {
    renderEdit(makeCourse());
    expect(screen.getByText("Edit Course")).toBeTruthy();
    expect(screen.getByText("Add PDFs")).toBeTruthy();
    expect(screen.getByText(/No PDFs yet/)).toBeTruthy();
    expect(screen.getByText("Upload instructor script")).toBeTruthy();
    expect(screen.getByText("No script uploaded.")).toBeTruthy();
  });

  it("lists every PDF on the course with its own visibility toggle", () => {
    renderEdit(makeCourse({ documents: [doc(1, "Syllabus", true), doc(2, "Range Rules"), doc(3, "Week 1 Notes")] }));
    expect(screen.getByText("Syllabus")).toBeTruthy();
    expect(screen.getByText("Range Rules")).toBeTruthy();
    expect(screen.getByText("Week 1 Notes")).toBeTruthy();
    expect(screen.getAllByText("Visible to students")).toHaveLength(3);
    expect(screen.getByText("3 PDFs Available")).toBeTruthy();
  });

  it("uploads several picked PDFs and adds each one to the course", async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: "file:///a.pdf", name: "Handout A.pdf" },
        { uri: "file:///b.pdf", name: "Handout B.pdf" },
      ],
    });
    (materialService.requestUploadUrl as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: { upload_url: "https://put/a", s3_key: "courses/1/materials/pdf/a.pdf", expires_in_seconds: 900 } })
      .mockResolvedValueOnce({ success: true, data: { upload_url: "https://put/b", s3_key: "courses/1/materials/pdf/b.pdf", expires_in_seconds: 900 } });
    (materialService.uploadFileToPresignedUrl as jest.Mock).mockResolvedValue({ success: true });
    (materialService.addCourseDocument as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: doc(10, "Handout A") })
      .mockResolvedValueOnce({ success: true, data: doc(11, "Handout B") });
    const onDocumentsChange = jest.fn();

    renderEdit(makeCourse(), { onDocumentsChange });
    fireEvent.press(screen.getByText("Add PDFs"));

    await waitFor(() => expect(materialService.addCourseDocument).toHaveBeenCalledTimes(2));
    expect(materialService.addCourseDocument).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ s3_key: "courses/1/materials/pdf/a.pdf", title: "Handout A", is_public: false })
    );
    expect(await screen.findByText("Handout B")).toBeTruthy();
    expect(onDocumentsChange).toHaveBeenLastCalledWith(1, expect.arrayContaining([expect.objectContaining({ id: 11 })]));
  });

  it("toggling a PDF's visibility saves it right away", async () => {
    (materialService.updateCourseDocument as jest.Mock).mockResolvedValueOnce({ success: true, data: doc(2, "Range Rules", true) });
    renderEdit(makeCourse({ documents: [doc(1, "Syllabus", true), doc(2, "Range Rules")] }));

    const switches = screen.UNSAFE_getAllByType(require("react-native").Switch);
    fireEvent(switches[1], "valueChange", true);

    await waitFor(() =>
      expect(materialService.updateCourseDocument).toHaveBeenCalledWith(1, 2, { is_public: true })
    );
  });

  it("does not send legacy pdf fields when saving the course", async () => {
    renderEdit(
      makeCourse({
        pdf_s3_key: "courses/1/materials/pdf/abc.pdf",
        pdf_filename: "syllabus.pdf",
        instructor_script_s3_key: "courses/1/materials/script/def.pdf",
        instructor_script_filename: "notes.pdf",
        documents: [doc(1, "Syllabus")],
      })
    );
    fireEvent.press(screen.getByText("Update Course"));
    await Promise.resolve();
    expect(mockOnUpdateCourse).toHaveBeenCalledTimes(1);
    const payload = mockOnUpdateCourse.mock.calls[0][0];
    expect(payload.pdf_s3_key).toBeUndefined();
    expect(payload.pdf_is_public).toBeUndefined();
    expect(payload.instructor_script_s3_key).toBe("courses/1/materials/script/def.pdf");
    expect(payload.instructor_script_filename).toBe("notes.pdf");
  });

  it("shows current script filename and Replace/Remove", () => {
    renderEdit(
      makeCourse({
        instructor_script_s3_key: "courses/1/materials/script/def.pdf",
        instructor_script_filename: "instructor-notes.pdf",
      })
    );
    expect(screen.getByText(/Current file: instructor-notes\.pdf/)).toBeTruthy();
    expect(screen.getByText("Replace script")).toBeTruthy();
  });

  it("skips a PDF over the size limit and does not upload it", async () => {
    const alertSpy = jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///big.pdf", name: "big.pdf" }],
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
      size: MAX_PDF_SCRIPT_SIZE_BYTES + 1,
    });

    renderEdit(makeCourse());
    fireEvent.press(screen.getByText("Add PDFs"));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Some PDFs were not added", expect.stringMatching(/big\.pdf.*limit/))
    );
    expect(materialService.requestUploadUrl).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
