/**
 * Tests for CourseForm — course materials upload: create vs edit, PDF/script upload UI, file size validation.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CourseForm from "@/src/components/masterAdmin/CourseForm";
import { materialService } from "@/src/services/materialService";
import { CourseAdminView } from "@/src/types/course.types";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { MAX_PDF_SCRIPT_SIZE_BYTES } from "@/src/constants/uploadLimits";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true }) }));
jest.mock("expo-file-system", () => ({ getInfoAsync: jest.fn().mockResolvedValue({ size: 1000 }) }));

jest.mock("@/src/services/materialService", () => ({
  materialService: {
    requestUploadUrl: jest.fn(),
    uploadFileToPresignedUrl: jest.fn(),
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

describe("CourseForm", () => {
  const mockOnClose = jest.fn();
  const mockOnCreateCourse = jest.fn().mockResolvedValue(undefined);
  const mockOnUpdateCourse = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("in create mode shows message to save course first for PDF and script", () => {
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
    expect(screen.getByText(/Save the course first, then add a PDF/)).toBeTruthy();
    expect(screen.getByText(/Save the course first, then add the script/)).toBeTruthy();
    expect(screen.getByText("Create New Course")).toBeTruthy();
  });

  it("in edit mode with no PDF shows Upload course PDF and Upload instructor script", () => {
    const course: CourseAdminView = {
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
    };
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
      />
    );
    expect(screen.getByText("Edit Course")).toBeTruthy();
    expect(screen.getByText("Upload course PDF")).toBeTruthy();
    expect(screen.getByText("Upload instructor script")).toBeTruthy();
    expect(screen.getByText("No PDF uploaded.")).toBeTruthy();
    expect(screen.getByText("No script uploaded.")).toBeTruthy();
  });

  it("in edit mode with PDF and script shows current filename and Replace/Remove", () => {
    const course: CourseAdminView = {
      id: 1,
      title: "Existing Course",
      viewType: "admin",
      description: "",
      required_gun_type: "Handgun",
      difficulty_level: "Beginner",
      pdf_s3_key: "courses/1/materials/pdf/abc.pdf",
      instructor_script_s3_key: "courses/1/materials/script/def.pdf",
      pdf_filename: "syllabus.pdf",
      instructor_script_filename: "instructor-notes.pdf",
      total_weeks: 24,
      is_active: true,
      order_index: 1,
      created_at: "",
      updated_at: "",
      videos: [],
    };
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
      />
    );
    expect(screen.getByText(/Current file: syllabus\.pdf/)).toBeTruthy();
    expect(screen.getByText(/Current file: instructor-notes\.pdf/)).toBeTruthy();
    expect(screen.getByText("Replace PDF")).toBeTruthy();
    expect(screen.getByText("Replace script")).toBeTruthy();
    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onUpdateCourse with pdf_filename and instructor_script_filename when present", async () => {
    const course: CourseAdminView = {
      id: 1,
      title: "Existing Course",
      viewType: "admin",
      description: "",
      required_gun_type: "Handgun",
      difficulty_level: "Beginner",
      pdf_s3_key: "courses/1/materials/pdf/abc.pdf",
      instructor_script_s3_key: "courses/1/materials/script/def.pdf",
      pdf_filename: "syllabus.pdf",
      instructor_script_filename: "notes.pdf",
      total_weeks: 24,
      is_active: true,
      order_index: 1,
      created_at: "",
      updated_at: "",
      videos: [],
    };
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
      />
    );
    const updateButton = screen.getByText("Update Course");
    fireEvent.press(updateButton);
    await Promise.resolve();
    expect(mockOnUpdateCourse).toHaveBeenCalledTimes(1);
    const payload = mockOnUpdateCourse.mock.calls[0][0];
    expect(payload.pdf_s3_key).toBe("courses/1/materials/pdf/abc.pdf");
    expect(payload.pdf_filename).toBe("syllabus.pdf");
    expect(payload.instructor_script_s3_key).toBe("courses/1/materials/script/def.pdf");
    expect(payload.instructor_script_filename).toBe("notes.pdf");
  });

  it("Remove PDF button clears PDF state (subsequent submit has no pdf_s3_key)", async () => {
    const course: CourseAdminView = {
      id: 1,
      title: "Course",
      viewType: "admin",
      description: "",
      required_gun_type: "Handgun",
      difficulty_level: "Beginner",
      pdf_s3_key: "courses/1/materials/pdf/x.pdf",
      instructor_script_s3_key: null,
      pdf_filename: "x.pdf",
      total_weeks: 24,
      is_active: true,
      order_index: 1,
      created_at: "",
      updated_at: "",
      videos: [],
    };
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
      />
    );
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.press(removeButtons[0]);
    const updateButton = screen.getByText("Update Course");
    fireEvent.press(updateButton);
    await Promise.resolve();
    const payload = mockOnUpdateCourse.mock.calls[0][0];
    expect(payload.pdf_s3_key).toBeUndefined();
    expect(payload.pdf_filename).toBeUndefined();
  });

  it("shows File too large alert and does not upload when PDF exceeds size limit", async () => {
    const alertSpy = jest.spyOn(require("react-native").Alert, "alert").mockImplementation(() => {});
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///big.pdf", name: "big.pdf" }],
    });
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
      size: MAX_PDF_SCRIPT_SIZE_BYTES + 1,
    });

    const course: CourseAdminView = {
      id: 1,
      title: "Course",
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
    render(
      <CourseForm
        visible
        course={course}
        isSubmitting={false}
        onClose={mockOnClose}
        onUpdateCourse={mockOnUpdateCourse}
      />
    );
    fireEvent.press(screen.getByText("Upload course PDF"));
    await Promise.resolve();
    await Promise.resolve();

    expect(alertSpy).toHaveBeenCalledWith("File too large", expect.stringMatching(/PDF.*under.*20/));
    expect(materialService.requestUploadUrl).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
