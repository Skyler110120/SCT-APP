import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { instructorDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/InstructorDashboardStyles/instructorDashboardStyles";
import { sessionService } from "@/src/services/sessionService";
import { SessionDetailed } from "@/src/types/sessions.types";
import { UserRole } from "@/src/types/enums";
import { formatTimeString } from "@/src/utils/dateTimeUtils";
import { isTestSessionRequired } from "@/src/utils/sessionRules";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

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
      const startOfDay = new Date(selectedDay);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDay);
      endOfDay.setHours(23, 59, 59, 999);

      const formatDate = (d: Date) => d.toISOString().split("T")[0];

      const response = await sessionService.getMyCalendarSessions({
        start_date: formatDate(startOfDay),
        end_date: formatDate(endOfDay),
      });

      if (response.success && response.data) {
        setSessions(response.data);
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

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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
      router.push({
        pathname: "/company/session-check-in",
        params: { sessionId: session.id.toString() },
      });
      return;
    }

    const weekNumber = session.week_number ?? session.enrollment_current_week;
    const useTestSession =
      session.is_test_session_required ??
      isTestSessionRequired(
        weekNumber,
        session.course_total_weeks,
        session.final_month_initial_test_passed
      );

    router.push({
      pathname: useTestSession ? "/company/test-session-form" : "/company/session-form",
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
                    {session.student_name || "Student"}
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
                    {session.status === "IN_PROGRESS" || session.status === "in_progress"
                      ? "RESUME"
                      : "START"}
                  </Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                fontSize: 16,
                fontFamily: "Chakra-Regular",
                paddingVertical: 24,
              }}
            >
              No sessions scheduled for this day
            </Text>
          )}
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}
