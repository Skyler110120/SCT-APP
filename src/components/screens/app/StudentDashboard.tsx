import BottomNavBar from "@/src/components/NavBar";
import StudentCancelSessionModal from "@/src/components/student/StudentCancelSessionModal";
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
    return {
      statusText,
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
        <Text style={styles.greeting}>Welcome back, {user?.first_name}!</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Course</Text>
            <Text style={styles.courseName}>{course.title}</Text>
            {course.videos?.length != null && (
              <Text style={styles.muted}>{course.videos.length} videos</Text>
            )}
            {showProgress && (
              <View style={{ marginTop: 12 }}>
                <View style={styles.progressLabels}>
                  <Text style={styles.body}>
                    {enrollment?.week_display ?? `Week ${enrollment?.current_week ?? 1}`} of{" "}
                    {course.total_weeks}
                  </Text>
                  {enrollment?.progress_percentage != null && (
                    <Text style={styles.body}>{enrollment.progress_percentage}% complete</Text>
                  )}
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, enrollment?.progress_percentage ?? 0)}%` },
                    ]}
                  />
                </View>
                <View style={{ marginTop: 10 }}>{renderMakeupLine()}</View>
              </View>
            )}
          </View>
        )}

        {course && bookingTrackSummary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stay on track</Text>
            <Text style={styles.body}>{bookingTrackSummary.statusText}</Text>
            <Text style={styles.body}>
              Next recommended booking window for week {bookingTrackSummary.nextWeekToBook}:{" "}
              <Text style={styles.bold}>{formatDateString(bookingTrackSummary.recommendedWeekStart)}</Text>{" "}
              to <Text style={styles.bold}>{formatDateString(bookingTrackSummary.recommendedWeekEnd)}</Text>.
            </Text>
            <Text style={styles.body}>
              Misses used: <Text style={styles.bold}>{bookingTrackSummary.missesUsed}</Text> / 4.
            </Text>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => openCalendarOn(bookingTrackSummary.recommendedWeekStart)}
            >
              <Text style={styles.outlineButtonText}>Open Calendar on recommended week</Text>
            </TouchableOpacity>
          </View>
        )}

        {course && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What&apos;s next</Text>
            <Text style={styles.body}>
              Head to{" "}
              <Text style={styles.link} onPress={() => router.push("/company/courses")}>
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
          <Text style={styles.cardTitle}>Upcoming Sessions</Text>
          {upcomingSessions.length === 0 ? (
            <>
              <Text style={[styles.body, styles.bold, { textAlign: "center" }]}>
                No sessions scheduled yet
              </Text>
              <Text style={[styles.muted, { textAlign: "center" }]}>
                Book a live session from Calendar when you&apos;re ready to practice with an instructor.
              </Text>
            </>
          ) : (
            upcomingSessions.map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>{session.title || session.course_title}</Text>
                  <Text style={styles.muted}>
                    {formatDateString(session.start_time)} at {formatTimeString(session.start_time)}
                  </Text>
                  {session.instructor_name && (
                    <Text style={styles.muted}>with {session.instructor_name}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => setSessionToCancel(session)}
                  accessibilityLabel="Cancel this session"
                >
                  <Text style={styles.smallButtonText}>Cancel</Text>
                </TouchableOpacity>
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
  scroll: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  greeting: { fontSize: 24, lineHeight: 30, fontFamily: "Oswald_500Medium", color: themes.textPrimary },
  date: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: themes.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 12,
    backgroundColor: themes.backgroundElevated,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: themes.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  courseName: { color: themes.white, fontSize: 17, fontFamily: "Inter_500Medium" },
  body: {
    color: themes.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  muted: { color: themes.textMuted, fontSize: 14, fontFamily: "Inter_400Regular" },
  bold: { fontWeight: "700", color: themes.white },
  link: { color: themes.vegasGold, fontWeight: "700" },
  warning: { color: "#fbbf24", fontSize: 14, lineHeight: 20, marginVertical: 6 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: 8, backgroundColor: themes.vegasGold },
  primaryButton: {
    backgroundColor: themes.vegasGold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: themes.black,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  outlineButton: {
    borderColor: themes.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: themes.backgroundSoft,
  },
  outlineButtonText: {
    color: themes.textPrimary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.borderStrong,
    gap: 10,
  },
  sessionTitle: { color: themes.white, fontSize: 16, fontFamily: "Inter_500Medium" },
  smallButton: {
    borderColor: themes.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: themes.backgroundSoft,
  },
  smallButtonText: {
    color: themes.textSecondary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 16,
  },
});
