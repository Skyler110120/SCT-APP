import InstructorTools from "@/src/components/instructor/InstructorTools";
import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { instructorDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/InstructorDashboardStyles/instructorDashboardStyles";
import { sessionService } from "@/src/services/sessionService";
import { SessionDetailed } from "@/src/types/sessions.types";
import { UserRole } from "@/src/types/enums";
import { formatDateForAPI, formatTimeString } from "@/src/utils/dateTimeUtils";
const CHECK_IN_OPENS_MINUTES_BEFORE = 15;

const isSameDay = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const getCheckInOpensAt = (session: SessionDetailed) =>
  new Date(new Date(session.start_time).getTime() - CHECK_IN_OPENS_MINUTES_BEFORE * 60 * 1000);

const isCheckInOpen = (session: SessionDetailed) => {
  const status = (session.status ?? "").toLowerCase();
  if (status !== "scheduled" && status !== "in_progress") return false;
  const now = Date.now();
  return (
    now >= getCheckInOpensAt(session).getTime() &&
    now <= new Date(session.end_time).getTime()
  );
};
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InstructorDashboard() {
  const { state, logout, needsOnboarding, user } = useAuth();

  const [today] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [sessions, setSessions] = useState<SessionDetailed[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - today.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [today]);

  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const dayBefore = new Date(selectedDay);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayAfter = new Date(selectedDay);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const response = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(dayBefore),
        end_date: formatDateForAPI(dayAfter),
      });

      if (response.success && response.data) {
        setSessions(
          response.data
            .filter((s) => isSameDay(new Date(s.start_time), selectedDay))
            .sort(
              (a, b) =>
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            )
        );
      }
    } catch (err) {
      console.error("Error loading dashboard sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    if (user && !needsOnboarding) {
      loadSessions();
    }
  }, [loadSessions, user, needsOnboarding]);

  const formatFullDate = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    if (day % 10 === 2 && day !== 12) suffix = "nd";
    if (day % 10 === 3 && day !== 13) suffix = "rd";

    return `${month} ${day}${suffix} ${year}`;
  };

  const formatDayName = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const formatDayNumber = (date: Date) => {
    const day = date.getDate();
    return day < 10 ? `0${day}` : `${day}`;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSessionPress = (session: SessionDetailed) => {
    if (user?.role === UserRole.STUDENT) {
      if (!isCheckInOpen(session)) {
        const opensAt = getCheckInOpensAt(session);
        Alert.alert(
          "Check-in not open",
          opensAt.getTime() > Date.now()
            ? `Check-in opens at ${formatTimeString(opensAt.toISOString())} (15 minutes before your session).`
            : "Check-in for this session has closed."
        );
        return;
      }
      router.push({
        pathname: "/company/session-check-in",
        params: { sessionId: session.id.toString() },
      });
      return;
    }

    router.push({
      pathname: "/company/session-form",
      params: { sessionId: session.id.toString() },
    });
  };

  if (needsOnboarding) {
    return (
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Welcome to Skills and Capabilities Training</Text>
          <Text style={styles.labelText}>
            Please enter your company invite code to access all features.
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.dateContainer}>
          <Text style={styles.todayText}>
            {isSameDay(selectedDay, today) ? "Today" : formatDayName(selectedDay)}
          </Text>
          <Text style={styles.fullDateText}>{formatFullDate(selectedDay)}</Text>
        </View>

        <View style={styles.weekContainer}>
          {weekDays.map((day, index) => {
            const dayNum = formatDayNumber(day);
            const dayName = formatDayName(day);
            const isSelected = isSameDay(day, selectedDay);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDayButton,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[styles.dayName, isSelected && styles.selectedDayText]}
                >
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sessions</Text>

          {isLoadingSessions ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator size="small" color={themes.vegasGold} />
            </View>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.classCard}
                onPress={() => handleSessionPress(session)}
              >
                <View style={styles.classTypeSection}>
                  <Text style={styles.classTypeText}>
                    Week{"\n"}{session.week_number ?? session.enrollment_current_week ?? "—"}
                  </Text>
                </View>

                <View style={styles.classInfoSection}>
                  <Text style={styles.classTimeText}>
                    {formatTimeString(session.start_time)}{" "}
                    {user?.role === UserRole.STUDENT
                      ? session.instructor_name || "Instructor"
                      : session.student_name || "Student"}
                  </Text>
                  <Text style={styles.classTimeText}>
                    {session.course_title || session.title || "Training Session"}
                    {session.participant_count != null && session.participant_count > 1
                      ? ` • ${session.participant_count} students`
                      : ""}
                  </Text>
                </View>

                <View style={styles.viewButtonSection}>
                  <Text style={styles.viewButtonText}>
                    {user?.role === UserRole.STUDENT
                      ? isCheckInOpen(session)
                        ? "CHECK IN"
                        : "VIEW"
                      : session.status === "IN_PROGRESS" || session.status === "in_progress"
                      ? "RESUME"
                      : "START"}
                  </Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyStateText}>
              No sessions scheduled for this day
            </Text>
          )}
        </View>
        <InstructorTools />
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}
