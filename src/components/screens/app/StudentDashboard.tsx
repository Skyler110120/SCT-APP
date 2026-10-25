import BottomNavBar from "@/src/components/NavBar";
import StudentCancelSessionModal, {
  CANCEL_CUTOFF_NOTE,
  studentCancelState,
} from "@/src/components/student/StudentCancelSessionModal";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { courseService } from "@/src/services/courseService";
import { paymentService } from "@/src/services/paymentService";
import { sessionService } from "@/src/services/sessionService";
import { BookingTrackContext } from "@/src/types/bookingTrack.types";
import { EnrollmentWithCourse, GRACE_MONTH_MAKEUP_SESSIONS } from "@/src/types/enrollment.types";
import { SubscriptionStatusData } from "@/src/types/payment.types";
import { SessionDetailed } from "@/src/types/sessions.types";
import { apiErrorMessage } from "@/src/utils/billingActions";
import {
  buildWeekStateMap,
  buildWeeksWithSession,
  getCommittedGapMissCount,
  resolveAnchorWeekStart,
  resolveRecommendedWeekStart,
  resolveTrackWeekNumber,
} from "@/src/utils/bookingTrack";
import {
  addDays,
  formatDateForAPI,
  formatDateString,
  formatTimeString,
  getWeekBounds,
} from "@/src/utils/dateTimeUtils";
import { openStripeHostedUrl } from "@/src/utils/safeExternalUrl";
import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateBlock, WeekTrack } from "@/src/components/ui";

const CHECK_IN_OPENS_MS = 15 * 60 * 1000;

const FALLBACK_SUB_STATUS: SubscriptionStatusData = {
  has_subscription: false,
  can_book_sessions: false,
  cancel_at_period_end: false,
  amount_cents: 20000,
  make_up_sessions_remaining: 0,
};

const isScheduled = (s: SessionDetailed) => (s.status ?? "").toLowerCase() === "scheduled";

const MAKEUP_INFO_STANDARD =
  "Your course expects one live class per calendar week (Sunday–Saturday). If you miss a week without completing a class, you will need to make up that instruction in your grace month. You have up to four included sessions that month to cover those makeups—no extra charge when you use them.";
const MAKEUP_INFO_POST =
  "After your program subscription ends, each prepaid credit covers one live class booking.";

const openCalendarOn = (date: string) =>
  router.push({ pathname: "/company/calendar", params: { date } });

const openCoursesAtWeek = (currentWeek: number | null | undefined) => {
  if (currentWeek != null && currentWeek > 0) {
    router.push({
      pathname: "/company/courses",
      params: { week: String(currentWeek) },
    });
    return;
  }
  router.push("/company/courses");
};

/** Student home screen (mirrors web StudentDashboard). */
export default function StudentDashboard() {
  const { user } = useAuth();

  const [enrollment, setEnrollment] = useState<EnrollmentWithCourse | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatusData | null>(null);
  const [calendarSessions, setCalendarSessions] = useState<SessionDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<SessionDetailed | null>(null);
  const [makeupLoading, setMakeupLoading] = useState(false);
  const [makeupError, setMakeupError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [courseResponse, subData] = await Promise.all([
        courseService.getMyEnrolledCourse(),
        paymentService.getSubscriptionStatus().catch(() => null),
      ]);
      setEnrollment(courseResponse.success && courseResponse.data ? courseResponse.data : null);
      setSubStatus(subData ?? FALLBACK_SUB_STATUS);

      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const sessionsResponse = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(today),
        end_date: formatDateForAPI(nextMonth),
      });
      setCalendarSessions(
        sessionsResponse.success && sessionsResponse.data ? sessionsResponse.data : []
      );
    } catch (error) {
      console.error("Error loading student dashboard:", error);
      setCalendarSessions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const now = Date.now();
  const checkInSession = useMemo(
    () =>
      calendarSessions
        .filter((s) => {
          if (!isScheduled(s)) return false;
          const start = new Date(s.start_time).getTime();
          const end = new Date(s.end_time).getTime();
          return now >= start - CHECK_IN_OPENS_MS && now <= end;
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0] ??
      null,
    [calendarSessions, now]
  );
  const upcomingSessions = useMemo(
    () =>
      calendarSessions
        .filter((s) => isScheduled(s) && new Date(s.start_time).getTime() > now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 10),
    [calendarSessions, now]
  );

  const bookingTrackSummary = useMemo(() => {
    if (!enrollment) return null;
    const todayWeekStart = getWeekBounds(new Date()).startDate;
    const context: BookingTrackContext = {
      currentWeekStart: todayWeekStart,
      cadence: enrollment.program_cadence === "BIWEEKLY" ? "BIWEEKLY" : "WEEKLY",
      anchorWeekStart: resolveAnchorWeekStart(
        enrollment.cadence_anchor_date,
        enrollment.enrolled_at,
        todayWeekStart
      ),
      baselineWeeksMissed: typeof enrollment.weeks_missed === "number" ? enrollment.weeks_missed : 0,
      weeksWithSession: buildWeeksWithSession(calendarSessions),
    };
    const recommendedWeekStart = resolveRecommendedWeekStart(enrollment.next_week_to_book, context);
    const map = buildWeekStateMap(
      todayWeekStart,
      addDays(todayWeekStart, 6 * 7),
      context,
      recommendedWeekStart
    );
    const recommendedState = map.get(recommendedWeekStart);
    const bookedWeeksFromCurrent = Array.from(context.weeksWithSession)
      .filter((weekStart) => weekStart >= todayWeekStart)
      .sort();
    const furthestBookedWeek = bookedWeeksFromCurrent[bookedWeeksFromCurrent.length - 1];
    const committedGapMisses = furthestBookedWeek
      ? getCommittedGapMissCount(
          context.currentWeekStart,
          addDays(furthestBookedWeek, 7),
          context.weeksWithSession,
          context.cadence,
          context.anchorWeekStart
        )
      : 0;
    const statusText =
      recommendedState === "upcomingGapMiss"
        ? "Off track: there is a gap before a booked future week."
        : recommendedState === "upcomingAtRisk"
          ? "At risk: book this week to stay on track."
          : "On track: keep booking in cadence.";
    const tone: "off" | "risk" | "ok" =
      recommendedState === "upcomingGapMiss"
        ? "off"
        : recommendedState === "upcomingAtRisk"
          ? "risk"
          : "ok";
    return {
      statusText,
      tone,
      recommendedWeekStart,
      recommendedWeekEnd: addDays(recommendedWeekStart, 6),
      missesUsed: context.baselineWeeksMissed + committedGapMisses,
      nextWeekToBook: resolveTrackWeekNumber(enrollment),
    };
  }, [enrollment, calendarSessions]);

  const missesUsed =
    bookingTrackSummary?.missesUsed ??
    (typeof enrollment?.weeks_missed === "number" ? enrollment.weeks_missed : 0);
  const standardMakeupClassesRemaining = Math.max(0, GRACE_MONTH_MAKEUP_SESSIONS - missesUsed);
  const postSubscriptionCredits =
    subStatus?.make_up_sessions_remaining ?? enrollment?.make_up_sessions_remaining ?? 0;
  const isPostSubscription = subStatus?.enrollment_phase === "POST_SUBSCRIPTION";

  const handleBuyMakeup = async () => {
    if (!enrollment?.id) return;
    setMakeupError(null);
    setMakeupLoading(true);
    try {
      const response = await paymentService.createMakeupCheckout(enrollment.id, {
        successUrl: Linking.createURL("/makeup-payment-success"),
        cancelUrl: Linking.createURL("/makeup-payment-cancel"),
      });
      const opened = response.checkout_url
        ? await openStripeHostedUrl(response.checkout_url)
        : false;
      if (!opened) {
        setMakeupError("Invalid checkout URL returned by server.");
        return;
      }
      await loadDashboardData();
    } catch (error) {
      setMakeupError(apiErrorMessage(error, "Could not start checkout."));
    } finally {
      setMakeupLoading(false);
    }
  };

  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderBillingCard = () => {
    if (!subStatus || !enrollment?.course) return null;
    if (!subStatus.can_book_sessions) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isPostSubscription ? "Continue your course" : "Training subscription"}
          </Text>
          {isPostSubscription ? (
            <>
              <Text style={styles.body}>
                Your program subscription has ended. To book each remaining class, purchase a session
                ($50). You&apos;ll receive one booking credit per payment.
              </Text>
              {makeupError && <Text style={styles.warning}>{makeupError}</Text>}
              <TouchableOpacity style={styles.primaryButton} onPress={handleBuyMakeup} disabled={makeupLoading}>
                <Text style={styles.primaryButtonText}>
                  {makeupLoading ? "Opening checkout…" : "Buy a class session ($50)"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.body}>
                {subStatus.status === "INCOMPLETE" &&
                  "Finish checkout to activate your subscription. If you already paid, pull down to refresh in a moment."}
                {!subStatus.has_subscription &&
                  subStatus.status !== "INCOMPLETE" &&
                  subStatus.status !== "PAST_DUE" &&
                  subStatus.status !== "CANCELLED" &&
                  "You're enrolled, but you don't have an active training subscription yet. Subscribe to pay your range and book live sessions."}
                {subStatus.status === "PAST_DUE" &&
                  "Your last payment failed. Update your payment method to keep booking sessions."}
                {subStatus.status === "CANCELLED" &&
                  "Your subscription is cancelled. Start a new subscription from your profile to book sessions."}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/learning/profile")}
              >
                <Text style={styles.primaryButtonText}>Open Profile — billing & subscribe</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }
    return (
      <View style={styles.card}>
        {isPostSubscription ? (
          <>
            <Text style={styles.cardTitle}>Prepaid class credits</Text>
            <Text style={styles.body}>
              You have <Text style={styles.bold}>{subStatus.make_up_sessions_remaining}</Text> booking
              credit{subStatus.make_up_sessions_remaining === 1 ? "" : "s"}. Each booked session uses
              one credit.
            </Text>
            <TouchableOpacity style={styles.outlineButton} onPress={handleBuyMakeup} disabled={makeupLoading}>
              <Text style={styles.outlineButtonText}>
                {makeupLoading ? "Opening…" : "Buy another session ($50)"}
              </Text>
            </TouchableOpacity>
            {makeupError && <Text style={styles.warning}>{makeupError}</Text>}
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Subscription active</Text>
            <Text style={styles.body}>
              Manage billing, payment method, or cancellation on{" "}
              <Text style={styles.link} onPress={() => router.push("/learning/profile")}>
                Profile
              </Text>
              .
            </Text>
          </>
        )}
      </View>
    );
  };

  const renderMakeupLine = () => {
    if (enrollment?.enrollment_phase === "POST_SUBSCRIPTION") {
      if (postSubscriptionCredits > 0) {
        return (
          <TouchableOpacity onPress={() => Alert.alert("Makeup classes", MAKEUP_INFO_POST)}>
            <Text style={styles.body}>
              You have{" "}
              <Text style={styles.bold}>
                {postSubscriptionCredits === 1 ? "1 makeup class" : `${postSubscriptionCredits} makeup classes`}
              </Text>{" "}
              remaining. <Text style={styles.link}>ⓘ</Text>
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <Text style={styles.warning}>
          You have <Text style={styles.bold}>no makeup classes</Text> remaining. Missing a week without
          completing a class will cause you to incur additional charges to complete the course.
        </Text>
      );
    }
    return (
      <TouchableOpacity onPress={() => Alert.alert("Makeup classes", MAKEUP_INFO_STANDARD)}>
        <Text style={styles.body}>
          You have{" "}
          <Text style={styles.bold}>
            {standardMakeupClassesRemaining === 1
              ? "1 makeup class"
              : `${standardMakeupClassesRemaining} makeup classes`}
          </Text>{" "}
          remaining. <Text style={styles.link}>ⓘ</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themes.vegasGold} />
          <Text style={styles.muted}>Loading dashboard...</Text>
        </View>
        <BottomNavBar />
      </SafeAreaView>
    );
  }

  const course = enrollment?.course;
  const showProgress =
    !!course &&
    (enrollment?.current_week != null || enrollment?.progress_percentage != null) &&
    course.total_weeks != null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={themes.vegasGold}
            onRefresh={() => {
              setIsRefreshing(true);
              loadDashboardData();
            }}
          />
        }
      >
        <Text style={styles.greeting} accessibilityRole="header">
          Welcome back, {user?.first_name}
        </Text>
        <Text style={styles.date}>{formattedToday}</Text>

        {renderBillingCard()}

        {!course && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get started</Text>
            <Text style={styles.body}>
              You&apos;re not enrolled in a course yet. Visit{" "}
              <Text style={styles.link} onPress={() => router.push("/company/courses")}>
                Courses
              </Text>{" "}
              to browse and enroll.
            </Text>
          </View>
        )}

        {course && (
          <View style={[styles.card, styles.programCard]}>
            <View style={styles.programBody}>
              <Text style={styles.eyebrow}>Your program</Text>
              <Text style={styles.courseName}>{course.title}</Text>
              {course.videos?.length != null && (
                <Text style={styles.muted}>
                  {course.videos.length} training videos
                  {course.total_weeks != null ? `, ${course.total_weeks} weeks` : ""}
                </Text>
              )}
              {showProgress && (
                <View style={styles.progressBlock}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.weekLabel}>
                      Week {enrollment?.current_week ?? 1}
                      <Text style={styles.weekOf}> of {course.total_weeks}</Text>
                    </Text>
                    {enrollment?.progress_percentage != null && (
                      <Text style={styles.muted}>{enrollment.progress_percentage}% complete</Text>
                    )}
                  </View>
                  <WeekTrack
                    totalWeeks={course.total_weeks ?? 24}
                    currentWeek={enrollment?.current_week ?? 1}
                  />
                </View>
              )}
            </View>
            {showProgress && <View style={styles.programFooter}>{renderMakeupLine()}</View>}
          </View>
        )}

        {course && bookingTrackSummary && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, styles.cardTitleInline]}>Stay on track</Text>
              {bookingTrackSummary.tone !== "ok" && (
                <View
                  style={[
                    styles.pill,
                    bookingTrackSummary.tone === "off" ? styles.pillDanger : styles.pillWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: bookingTrackSummary.tone === "off" ? themes.danger : themes.warning },
                    ]}
                  >
                    {bookingTrackSummary.tone === "off" ? "Off track" : "At risk"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.body}>
              {bookingTrackSummary.tone === "ok"
                ? bookingTrackSummary.statusText
                : bookingTrackSummary.statusText.replace(/^[^:]+:\s*/, "").replace(/^./, (c) => c.toUpperCase())}
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Book week {bookingTrackSummary.nextWeekToBook} between</Text>
              <Text style={styles.statValue}>
                {formatDateString(bookingTrackSummary.recommendedWeekStart)} and{" "}
                {formatDateString(bookingTrackSummary.recommendedWeekEnd)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Missed weeks</Text>
              <View style={styles.missRow}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[styles.missTick, i < bookingTrackSummary.missesUsed ? styles.missTickUsed : null]}
                  />
                ))}
                <Text style={styles.statValue}>{bookingTrackSummary.missesUsed} of 4 used</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => openCalendarOn(bookingTrackSummary.recommendedWeekStart)}
            >
              <Text style={styles.primaryButtonText}>
                Book week {bookingTrackSummary.nextWeekToBook}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {course && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What&apos;s next</Text>
            <Text style={styles.body}>
              Head to{" "}
              <Text style={styles.link} onPress={() => openCoursesAtWeek(enrollment?.current_week)}>
                Courses
              </Text>{" "}
              to watch this week&apos;s videos.
              {upcomingSessions.length === 0 &&
                " Book a live session from Calendar when you're ready to practice with an instructor."}
            </Text>
          </View>
        )}

        {checkInSession && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Check in now</Text>
            <Text style={styles.body}>
              Your session at {formatTimeString(checkInSession.start_time)} is coming up. Complete your
              pre-training questions now.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push({
                  pathname: "/company/session-check-in",
                  params: { sessionId: String(checkInSession.id) },
                })
              }
            >
              <Text style={styles.primaryButtonText}>Open check-in</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, styles.cardTitleInline]}>Upcoming sessions</Text>
            {upcomingSessions.length > 0 && (
              <Text style={styles.muted}>{upcomingSessions.length} booked</Text>
            )}
          </View>
          {upcomingSessions.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={[styles.body, styles.bold, { textAlign: "center" }]}>
                No sessions scheduled yet
              </Text>
              <Text style={[styles.muted, { textAlign: "center" }]}>
                Book a live session from Calendar when you&apos;re ready to practice with an instructor.
              </Text>
            </View>
          ) : (
            upcomingSessions.map((session, index) => (
              <View key={session.id} style={[styles.sessionRow, index === 0 ? styles.sessionRowFirst : null]}>
                <DateBlock date={session.start_time} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>{session.title || session.course_title}</Text>
                  <Text style={styles.muted}>{formatTimeString(session.start_time)}</Text>
                  {session.instructor_name && (
                    <Text style={styles.muted}>with {session.instructor_name}</Text>
                  )}
                </View>
                {(() => {
                  const cancelState = studentCancelState(session);
                  if (cancelState === null) return null;
                  return (
                    <View style={styles.cancelAction}>
                      <TouchableOpacity
                        style={[styles.cancelButton, !cancelState && styles.cancelButtonDisabled]}
                        onPress={() => setSessionToCancel(session)}
                        disabled={!cancelState}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel this session"
                        accessibilityState={{ disabled: !cancelState }}
                        accessibilityHint={cancelState ? undefined : CANCEL_CUTOFF_NOTE}
                        hitSlop={6}
                      >
                        <Text style={[styles.cancelButtonText, !cancelState && styles.cancelButtonTextDisabled]}>
                          Cancel session
                        </Text>
                      </TouchableOpacity>
                      {!cancelState && <Text style={styles.cancelNote}>{CANCEL_CUTOFF_NOTE}</Text>}
                    </View>
                  );
                })()}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <StudentCancelSessionModal
        session={sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onCancelled={loadDashboardData}
        onReschedule={openCalendarOn}
      />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themes.background },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  greeting: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.textPrimary,
  },
  date: {
    fontSize: 15,
    fontFamily: "Archivo_400Regular",
    color: themes.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: themes.border,
    borderRadius: 12,
    backgroundColor: themes.backgroundElevated,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: themes.textPrimary,
    fontSize: 19,
    lineHeight: 23,
    fontFamily: "ArchivoNarrow_700Bold",
    marginBottom: 8,
  },
  cardTitleInline: { marginBottom: 0, flexShrink: 1 },
  programCard: { padding: 0, overflow: "hidden" },
  programBody: { padding: 16 },
  programFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: themes.surfaceSunken,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.border,
  },
  eyebrow: {
    color: themes.vegasGold,
    fontSize: 13,
    fontFamily: "Archivo_500Medium",
    marginBottom: 4,
  },
  courseName: {
    color: themes.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "ArchivoNarrow_700Bold",
    marginBottom: 2,
  },
  progressBlock: { marginTop: 16, gap: 10 },
  weekLabel: {
    color: themes.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: "ArchivoNarrow_700Bold",
  },
  weekOf: {
    color: themes.textMuted,
    fontSize: 17,
    fontFamily: "ArchivoNarrow_600SemiBold",
  },
  body: {
    color: themes.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Archivo_400Regular",
    marginBottom: 6,
  },
  muted: { color: themes.textMuted, fontSize: 14, lineHeight: 19, fontFamily: "Archivo_400Regular" },
  bold: { fontFamily: "Archivo_600SemiBold", color: themes.textPrimary },
  link: { color: themes.vegasGold, fontFamily: "Archivo_600SemiBold" },
  warning: { color: themes.warning, fontSize: 14, lineHeight: 20, marginVertical: 6 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  pillWarning: { backgroundColor: themes.warningBg, borderColor: "rgba(226,169,78,0.3)" },
  pillDanger: { backgroundColor: themes.dangerBg, borderColor: "rgba(232,115,95,0.3)" },
  pillText: { fontSize: 12, lineHeight: 15, fontFamily: "Archivo_600SemiBold" },
  statRow: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.border,
    gap: 4,
  },
  statLabel: { color: themes.textMuted, fontSize: 13, fontFamily: "Archivo_400Regular" },
  statValue: { color: themes.textPrimary, fontSize: 15, fontFamily: "Archivo_600SemiBold" },
  missRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  missTick: { width: 18, height: 6, borderRadius: 2, backgroundColor: themes.surface3 },
  missTickUsed: { backgroundColor: themes.warning },
  primaryButton: {
    backgroundColor: themes.vegasGold,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: themes.accentForeground,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  outlineButton: {
    borderColor: themes.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  outlineButtonText: {
    color: themes.textPrimary,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  emptyBlock: { gap: 4, paddingVertical: 8 },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.border,
    gap: 12,
  },
  sessionRowFirst: { borderTopWidth: 0, paddingTop: 4 },
  sessionTitle: {
    color: themes.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Archivo_600SemiBold",
    marginBottom: 2,
  },
  cancelAction: { alignItems: "flex-end", maxWidth: 130, gap: 4 },
  cancelButton: {
    borderColor: themes.danger,
    backgroundColor: themes.dangerBg,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cancelButtonDisabled: { borderColor: themes.borderStrong, backgroundColor: "transparent" },
  cancelButtonText: {
    color: themes.danger,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    lineHeight: 16,
  },
  cancelButtonTextDisabled: { color: themes.textSecondary },
  cancelNote: { color: themes.textSecondary, fontSize: 11, lineHeight: 14, textAlign: "right" },
});
