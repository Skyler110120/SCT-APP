import React, { useRef } from "react";
import { ScrollView, View } from "react-native";
import { render, screen, within } from "@testing-library/react-native";

import CourseSchedule, {
  classGlobalWeek,
  isCurrentProgramWeek,
  programMonthIndexForWeek,
} from "@/src/components/course/CourseSchedule";
import { drillService } from "@/src/services/courseDrillService";
import { CourseStructure } from "@/src/types/course.drills.types";

jest.mock("@/src/components/InAppVideoPlayer", () => ({
  InAppVideoPlayer: () => null,
}));

jest.mock("@/src/components/course/DrillDetailModal", () => () => null);

jest.mock("@/src/services/courseDrillService", () => ({
  drillService: {
    getCourseStructure: jest.fn(),
  },
}));

const mockGetCourseStructure = drillService.getCourseStructure as jest.MockedFunction<
  typeof drillService.getCourseStructure
>;

function cls(
  id: number,
  weekIndex: number,
  title: string,
  globalWeek?: number
) {
  return {
    id,
    course_month_id: 1,
    week_index: weekIndex,
    title,
    display_order: weekIndex,
    class_drills: [],
    ...(globalWeek != null ? { global_week_number: globalWeek } : {}),
    created_at: "",
    updated_at: "",
  };
}

function structure(withGlobalWeek: boolean): CourseStructure {
  return {
    course_id: 1,
    course_title: "Pistol 101",
    total_weeks: 24,
    months: [
      {
        id: 1,
        course_id: 1,
        month_index: 1,
        title: "Month 1",
        display_order: 1,
        classes: [cls(11, 1, "Grip", withGlobalWeek ? 1 : undefined)],
        created_at: "",
        updated_at: "",
      },
      {
        id: 2,
        course_id: 1,
        month_index: 2,
        title: "Month 2",
        display_order: 2,
        classes: [cls(21, 1, "Draw", withGlobalWeek ? 5 : undefined)],
        created_at: "",
        updated_at: "",
      },
    ],
  };
}

function ScheduleHarness({
  focusWeek,
  studentMonthLimit = 6,
}: {
  focusWeek?: number | null;
  studentMonthLimit?: number | null;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  return (
    <ScrollView ref={scrollRef}>
      <View ref={contentRef}>
        <CourseSchedule
          courseId={1}
          isStudent
          isStaff={false}
          studentMonthLimit={studentMonthLimit}
          studentUnlockedProgramMonth={studentMonthLimit}
          focusWeek={focusWeek}
          scrollNonce={focusWeek ? 1 : 0}
          scrollRef={scrollRef}
          contentRef={contentRef}
        />
      </View>
    </ScrollView>
  );
}

describe("course week targeting", () => {
  it("maps a curriculum week onto month and week index", () => {
    expect(programMonthIndexForWeek(7)).toBe(2);
    expect(classGlobalWeek(2, { week_index: 3 })).toBe(7);
    expect(classGlobalWeek(2, { week_index: 1, global_week_number: 5 })).toBe(5);
    expect(isCurrentProgramWeek(2, { week_index: 3 }, 7)).toBe(true);
    expect(isCurrentProgramWeek(2, { week_index: 1 }, 7)).toBe(false);
  });
});

describe("CourseSchedule current week", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks the class for the student's current curriculum week", async () => {
    mockGetCourseStructure.mockResolvedValue({ success: true, data: structure(true) });
    render(<ScheduleHarness focusWeek={5} />);

    const current = await screen.findByTestId("current-course-week");
    expect(within(current).getByText("Week 1: Draw")).toBeTruthy();
    expect(within(current).getByText("This week")).toBeTruthy();
    expect(screen.getAllByText("This week")).toHaveLength(1);
  });

  it("falls back to month and week index when global week is omitted", async () => {
    mockGetCourseStructure.mockResolvedValue({ success: true, data: structure(false) });
    render(<ScheduleHarness focusWeek={5} />);

    const current = await screen.findByTestId("current-course-week");
    expect(within(current).getByText("Week 1: Draw")).toBeTruthy();
  });

  it("does not mark a week when opened without a week deep link", async () => {
    mockGetCourseStructure.mockResolvedValue({ success: true, data: structure(true) });
    render(<ScheduleHarness focusWeek={null} />);

    await screen.findByText("Week 1: Grip");
    expect(screen.queryByText("This week")).toBeNull();
    expect(screen.queryByTestId("current-course-week")).toBeNull();
  });

  it("scrolls to the locked month when that week's classes are still hidden", async () => {
    const locked = structure(true);
    locked.months[1].classes = [];
    mockGetCourseStructure.mockResolvedValue({ success: true, data: locked });
    render(<ScheduleHarness focusWeek={5} studentMonthLimit={1} />);

    const current = await screen.findByTestId("current-course-week");
    expect(within(current).getByText("Month 2")).toBeTruthy();
    expect(screen.queryByText("Week 1: Draw")).toBeNull();
  });
});
