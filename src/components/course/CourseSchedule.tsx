import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DrillDetailModal from "@/src/components/course/DrillDetailModal";
import { InAppVideoPlayer } from "@/src/components/InAppVideoPlayer";
import { themes } from "@/src/context/themes";
import { drillService } from "@/src/services/courseDrillService";
import {
  ClassDrill,
  ClassWithDrills,
  CourseMonthWithClasses,
  CourseStructure,
  DrillVideo,
} from "@/src/types/course.drills.types";

type WeekClass = { week_index: number; global_week_number?: number | null };

type Props = {
  courseId: number;
  isStudent: boolean;
  isStaff: boolean;
  /** Students: highest month whose weekly breakdown is visible (unlocked_program_month ?? current_month). */
  studentMonthLimit: number | null;
  /** Students: unlocked_program_month from the enrollment; < 1 means no paid month yet. */
  studentUnlockedProgramMonth?: number | null;
  /** Bumped by the parent on pull-to-refresh. */
  refreshKey?: number;
  /** Curriculum week (`enrollment.current_week`) to bring into view. */
  focusWeek?: number | null;
  /** Increments each time the courses screen is opened with `focusWeek`. */
  scrollNonce?: number;
  scrollRef?: React.RefObject<ScrollView | null>;
  contentRef?: React.RefObject<View | null>;
};

/** Curriculum week used by the course schedule: 4 classes per program month. */
export function classGlobalWeek(monthIndex: number, cls: WeekClass): number {
  return cls.global_week_number ?? (monthIndex - 1) * 4 + cls.week_index;
}

export function isCurrentProgramWeek(monthIndex: number, cls: WeekClass, focusWeek: number): boolean {
  return classGlobalWeek(monthIndex, cls) === focusWeek;
}

export function programMonthIndexForWeek(focusWeek: number): number {
  return Math.floor((focusWeek - 1) / 4) + 1;
}

const text = { color: themes.white } as const;
const muted = { color: themes.white, opacity: 0.7, fontSize: 13 } as const;
const currentWeekLabel = { color: themes.vegasGold, fontSize: 12, fontWeight: "700" as const };
const currentWeekCard = {
  marginTop: 6,
  padding: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: themes.vegasGold,
  backgroundColor: "rgba(197, 179, 88, 0.12)",
};

const monthTitleOf = (month: CourseMonthWithClasses) =>
  month.title?.trim() || `Month ${month.month_index}`;
const classTitleOf = (cls: ClassWithDrills) => cls.title?.trim() || `Class ${cls.week_index}`;

export default function CourseSchedule({
  courseId,
  isStudent,
  isStaff,
  studentMonthLimit,
  studentUnlockedProgramMonth,
  refreshKey = 0,
  focusWeek = null,
  scrollNonce = 0,
  scrollRef,
  contentRef,
}: Props) {
  const [structure, setStructure] = useState<CourseStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [drillDetail, setDrillDetail] = useState<{ classDrill: ClassDrill; weekContextLine: string } | null>(null);
  const [playback, setPlayback] = useState<{ url: string; title: string } | null>(null);
  const [openingVideoId, setOpeningVideoId] = useState<number | null>(null);
  const focusAnchorRef = useRef<View>(null);
  const handledScrollNonce = useRef<number | null>(null);
  const anchorLaidOut = useRef(false);

  const scrollToCurrentWeek = useCallback(() => {
    if (focusWeek == null || scrollNonce === 0 || !anchorLaidOut.current) return;
    if (handledScrollNonce.current === scrollNonce) return;
    const target = focusAnchorRef.current;
    const content = contentRef?.current;
    const scroller = scrollRef?.current;
    if (
      !target ||
      !content ||
      !scroller ||
      typeof target.measureInWindow !== "function" ||
      typeof content.measureInWindow !== "function"
    ) {
      return;
    }
    try {
      target.measureInWindow((_targetX, targetY) => {
        content.measureInWindow((_contentX, contentY) => {
          if (handledScrollNonce.current === scrollNonce) return;
          scroller.scrollTo({ y: Math.max(0, targetY - contentY - 12), animated: true });
          handledScrollNonce.current = scrollNonce;
        });
      });
    } catch {
      // The native node is not measurable until layout finishes.
    }
  }, [contentRef, focusWeek, scrollNonce, scrollRef]);

  const handleAnchorLayout = useCallback(() => {
    anchorLaidOut.current = true;
    scrollToCurrentWeek();
  }, [scrollToCurrentWeek]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    drillService
      .getCourseStructure(courseId)
      .then((res) => {
        if (!cancelled) setStructure(res.success && res.data ? res.data : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, refreshKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(scrollToCurrentWeek);
    return () => cancelAnimationFrame(frame);
  }, [scrollToCurrentWeek, structure]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openDrillVideo = async (drillId: number, video: DrillVideo) => {
    if (openingVideoId != null) return;
    setOpeningVideoId(video.id);
    try {
      const res = await drillService.getDrillVideoAccessUrl(drillId, video.id);
      if (res.success && res.data?.access_url) {
        setPlayback({
          url: res.data.access_url,
          title: video.title || video.video_filename || "Video",
        });
      } else {
        Alert.alert("Video unavailable", res.error || "Unable to open this video right now.");
      }
    } finally {
      setOpeningVideoId(null);
    }
  };

  const renderDrills = (month: CourseMonthWithClasses, cls: ClassWithDrills) => (
    <View style={{ marginTop: 4 }}>
      {(cls.class_drills ?? [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map((cd) => {
          const firstVideo = cd.drill.videos?.[0];
          return (
            <View key={cd.id} style={{ paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                  accessibilityLabel={`Drill details: ${cd.drill.name}`}
                  onPress={() =>
                    setDrillDetail({
                      classDrill: cd,
                      weekContextLine: `${monthTitleOf(month)} · Week ${cls.week_index}: ${classTitleOf(cls)}`,
                    })
                  }
                >
                  <Text style={[text, { flex: 1 }]}>
                    {cd.drill.name}
                    {cd.is_homework ? " (Homework)" : ""}
                    {cd.duration_minutes != null ? ` · ${cd.duration_minutes} min` : ""}
                  </Text>
                  <FontAwesome name="chevron-right" size={12} color={themes.vegasGold} />
                </TouchableOpacity>
                {firstVideo && (
                  <TouchableOpacity
                    onPress={() => openDrillVideo(cd.drill.id, firstVideo)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      borderWidth: 1,
                      borderColor: themes.vegasGold,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <FontAwesome name="play" size={10} color={themes.vegasGold} />
                    <Text style={{ color: themes.vegasGold, fontSize: 12 }}>
                      {openingVideoId === firstVideo.id ? "Opening..." : "Watch Video"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {!!cd.drill.purpose && <Text style={muted}>{cd.drill.purpose}</Text>}
              {(cd.drill.videos?.length ?? 0) > 1 &&
                (cd.drill.videos ?? []).slice(1).map((v) => (
                  <TouchableOpacity key={v.id} onPress={() => openDrillVideo(cd.drill.id, v)}>
                    <Text style={{ color: themes.vegasGold, fontSize: 12, marginTop: 2 }}>
                      Watch {v.title || v.video_filename || "video"}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
    </View>
  );

  const renderClassMeta = (cls: ClassWithDrills) =>
    (cls.endstate || cls.round_count != null) && (
      <Text style={muted}>
        {[cls.endstate && `End state: ${cls.endstate}`, cls.round_count != null && `Rounds: ${cls.round_count}`]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    );

  const renderClasses = (month: CourseMonthWithClasses, nestedWeekToggle: boolean) =>
    (month.classes ?? [])
      .slice()
      .sort((a, b) => a.week_index - b.week_index)
      .map((cls) => {
        const drillCount = cls.class_drills?.length ?? 0;
        const weekOpen = expandedWeeks.has(cls.id);
        const isCurrentWeek = focusWeek != null && isCurrentProgramWeek(month.month_index, cls, focusWeek);
        return (
          <View
            key={cls.id}
            ref={isCurrentWeek ? focusAnchorRef : undefined}
            collapsable={false}
            onLayout={isCurrentWeek ? handleAnchorLayout : undefined}
            testID={isCurrentWeek ? "current-course-week" : undefined}
            style={isCurrentWeek ? currentWeekCard : { marginTop: 10 }}
          >
            {nestedWeekToggle ? (
              <TouchableOpacity
                onPress={() => toggle(setExpandedWeeks, cls.id)}
                accessibilityState={{ expanded: weekOpen }}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <FontAwesome name={weekOpen ? "chevron-down" : "chevron-right"} size={12} color={themes.vegasGold} />
                <Text style={[text, { fontWeight: "600", flex: 1 }]}>
                  Week {cls.week_index}: {classTitleOf(cls)}
                </Text>
                {isCurrentWeek && <Text style={currentWeekLabel}>This week</Text>}
                <Text style={muted}>
                  {drillCount} drill{drillCount !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[text, { fontWeight: "600", flex: 1 }]}>
                  Week {cls.week_index}: {classTitleOf(cls)}
                </Text>
                {isCurrentWeek && <Text style={currentWeekLabel}>This week</Text>}
              </View>
            )}
            {renderClassMeta(cls)}
            {(!nestedWeekToggle || weekOpen) && renderDrills(month, cls)}
          </View>
        );
      });

  const months = (structure?.months ?? []).slice().sort((a, b) => a.display_order - b.display_order);

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <FontAwesome name="calendar" size={18} color={themes.vegasGold} />
        <Text style={{ color: themes.white, fontSize: 18, fontWeight: "700" }}>Course schedule</Text>
      </View>
      {isStudent && (
        <Text style={[muted, { marginBottom: 8 }]}>
          Every month of the course is listed below. Weekly class and drill details unlock as you reach each month in
          the program and your subscription covers that program month. Select a drill to see setup, loadout/commands
          and more—use &quot;Watch Video&quot; when you want the demo.
        </Text>
      )}
      {isStudent && (studentUnlockedProgramMonth ?? 0) < 1 && (
        <Text style={[muted, { marginBottom: 8 }]}>
          Course schedule details will unlock after your first subscription payment succeeds.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={themes.vegasGold} />
      ) : months.length === 0 ? (
        <Text style={muted}>No schedule data for this course.</Text>
      ) : (
        months.map((month) => {
          const monthLocked = studentMonthLimit != null && month.month_index > studentMonthLimit;
          const classes = month.classes ?? [];
          const drillCount = classes.reduce((sum, c) => sum + (c.class_drills?.length ?? 0), 0);
          const monthOpen = expandedMonths.has(month.id);
          const monthIsFocusFallback =
            focusWeek != null &&
            month.month_index === programMonthIndexForWeek(focusWeek) &&
            !classes.some((cls) => isCurrentProgramWeek(month.month_index, cls, focusWeek));
          return (
            <View
              key={month.id}
              ref={monthIsFocusFallback ? focusAnchorRef : undefined}
              collapsable={false}
              onLayout={monthIsFocusFallback ? handleAnchorLayout : undefined}
              testID={monthIsFocusFallback ? "current-course-week" : undefined}
              style={{
                borderWidth: 1,
                borderColor: monthIsFocusFallback ? themes.vegasGold : "rgba(197, 179, 88, 0.35)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                opacity: monthLocked ? 0.75 : 1,
              }}
            >
              {monthLocked ? (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <FontAwesome name="lock" size={14} color={themes.vegasGold} />
                    <Text style={[text, { fontWeight: "700", fontSize: 16 }]}>{monthTitleOf(month)}</Text>
                  </View>
                  <Text style={[muted, { marginTop: 4 }]}>
                    Weekly class and drill breakdown unlocks when you reach this month in the program.
                  </Text>
                </>
              ) : isStaff ? (
                <>
                  <TouchableOpacity
                    onPress={() => toggle(setExpandedMonths, month.id)}
                    accessibilityState={{ expanded: monthOpen }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  >
                    <FontAwesome name={monthOpen ? "chevron-down" : "chevron-right"} size={14} color={themes.vegasGold} />
                    <Text style={[text, { fontWeight: "700", fontSize: 16, flex: 1 }]}>{monthTitleOf(month)}</Text>
                    <Text style={muted}>
                      {classes.length} week{classes.length !== 1 ? "s" : ""} · {drillCount} drill
                      {drillCount !== 1 ? "s" : ""}
                    </Text>
                  </TouchableOpacity>
                  {monthOpen && renderClasses(month, true)}
                </>
              ) : (
                <>
                  <Text style={[text, { fontWeight: "700", fontSize: 16 }]}>{monthTitleOf(month)}</Text>
                  {renderClasses(month, false)}
                </>
              )}
            </View>
          );
        })
      )}

      <DrillDetailModal
        classDrill={drillDetail?.classDrill ?? null}
        weekContextLine={drillDetail?.weekContextLine}
        hideInstructorNotes={isStudent}
        onClose={() => setDrillDetail(null)}
        onWatchVideo={openDrillVideo}
      />
      <InAppVideoPlayer
        visible={playback != null}
        url={playback?.url ?? null}
        title={playback?.title}
        onClose={() => setPlayback(null)}
      />
    </View>
  );
}
