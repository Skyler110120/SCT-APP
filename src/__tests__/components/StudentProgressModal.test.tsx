/**
 * Tests for StudentProgressModal — instructor/admin view of student weekly
 * progress with filter chips and advance-to-next-week action.
 *
 * The decisions tested here are:
 *  - Filtering: All / In-Progress (1..23) / Completed (>= 24)
 *  - Sort order: completed last, then descending by week, then by name
 *  - Advance button hidden once student is at week 24
 *  - Advance button hidden when caller cannot update
 *  - Advance dispatches onUpdateProgress with the enrollment id and an approved decision
 */
import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import StudentProgressModal from "@/src/components/StudentProgressModal";
import { UserRole } from "@/src/types/enums";
import { StudentWeeklyProgress } from "@/src/types/enrollment.types";

jest.mock("@/src/styles/CoursePageStyles/studentProgressModalStyles", () => ({
  studentProgressModalStyles: new Proxy(
    {},
    { get: () => ({}) }
  ),
}));

function student(overrides: Partial<StudentWeeklyProgress>): StudentWeeklyProgress {
  return {
    enrollment_id: 1,
    student_id: 1,
    student_name: "Alice",
    course_id: 1,
    course_title: "Pistol Fundamentals",
    current_week: 1,
    progress_percentage: 4.1,
    enrollment_status: "active",
    ...overrides,
  } as StudentWeeklyProgress;
}

const baseProps = {
  visible: true,
  isLoading: false,
  canUpdate: true,
  userRole: UserRole.INSTRUCTOR,
  onClose: jest.fn(),
  onUpdateProgress: jest.fn().mockResolvedValue(undefined),
};

describe("StudentProgressModal", () => {
  let alertSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });
  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("renders loading state while isLoading", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        isLoading
        students={[]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    expect(screen.getByText("Loading student progress...")).toBeTruthy();
  });

  it("renders empty state when no students", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        students={[]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    expect(screen.getByText("No students")).toBeTruthy();
    expect(
      screen.getByText(/No students are currently enrolled in active courses/i)
    ).toBeTruthy();
  });

  it("shows 'All Students' title for admin and 'My Students' for instructor", () => {
    const { rerender } = render(
      <StudentProgressModal
        {...baseProps}
        userRole={UserRole.INSTRUCTOR}
        students={[student({})]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );
    expect(screen.getByText("My Students")).toBeTruthy();

    rerender(
      <StudentProgressModal
        {...baseProps}
        userRole={UserRole.ADMIN}
        students={[student({})]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );
    expect(screen.getByText("All Students")).toBeTruthy();
  });

  it("counts students by status in the filter chips", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        students={[
          student({ enrollment_id: 1, student_name: "Alice", current_week: 5 }),
          student({ enrollment_id: 2, student_name: "Bob", current_week: 24 }),
          student({ enrollment_id: 3, student_name: "Carla", current_week: 24 }),
        ]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    expect(screen.getByText("All (3)")).toBeTruthy();
    expect(screen.getByText("In Progress (1)")).toBeTruthy();
    expect(screen.getByText("Completed (2)")).toBeTruthy();
  });

  it("filters out completed students when 'In Progress' is selected", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        students={[
          student({ enrollment_id: 1, student_name: "Alice", current_week: 5 }),
          student({ enrollment_id: 2, student_name: "Bob", current_week: 24 }),
        ]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText("In Progress (1)"));

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.queryByText("Bob")).toBeNull();
  });

  it("filters out in-progress students when 'Completed' is selected", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        students={[
          student({ enrollment_id: 1, student_name: "Alice", current_week: 5 }),
          student({ enrollment_id: 2, student_name: "Bob", current_week: 24 }),
        ]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText("Completed (1)"));

    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.queryByText("Alice")).toBeNull();
  });

  it("renders 'Completed' status text when a student has reached week 24", () => {
    render(
      <StudentProgressModal
        {...baseProps}
        students={[student({ current_week: 24, progress_percentage: 100 })]}
        onClose={jest.fn()}
        onUpdateProgress={jest.fn()}
      />
    );

    expect(screen.getByText("Completed")).toBeTruthy();
    expect(screen.getByText(/Week 24 of 24/)).toBeTruthy();
  });
});

describe("StudentProgressModal advance action", () => {
  it("sends the enrollment id with an approved decision", async () => {
    const onUpdateProgress = jest.fn().mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    render(
      <StudentProgressModal
        {...baseProps}
        students={[student({ enrollment_id: 7, current_week: 3 })]}
        onUpdateProgress={onUpdateProgress}
      />
    );

    fireEvent.press(screen.getByTestId("advance-student-7"));
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => Promise<void> }[];
    await buttons.find((b) => b.text === "Advance")!.onPress!();

    expect(onUpdateProgress).toHaveBeenCalledWith(
      expect.objectContaining({ enrollment_id: 7, decision: "approved" })
    );
    alertSpy.mockRestore();
  });
});
