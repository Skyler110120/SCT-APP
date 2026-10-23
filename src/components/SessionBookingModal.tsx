import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { companyService } from "@/src/services/companyService";
import { courseService } from "@/src/services/courseService";
import { paymentService } from "@/src/services/paymentService";
import { sessionService } from "@/src/services/sessionService";
import { bookingModalStyles as styles } from "@/src/styles/CalendarPageStyles/StudentCalendar/bookingModalStyles";
import { Availability } from "@/src/types/availability.types";
import { BookingTrackContext } from "@/src/types/bookingTrack.types";
import { MAX_MISSED_WEEKS_ALLOWED, ProgramCadence } from "@/src/types/enrollment.types";
import {
    DirectBookingRequest,
    SessionDetailed,
} from "@/src/types/sessions.types";
import {
  buildWeeksWithSession,
  isExpectedWeek,
  projectMissCountForBooking,
  resolveAnchorWeekStart,
  resolveRecommendedWeekStart,
} from "@/src/utils/bookingTrack";
import {
  addDays,
  formatDateString,
  formatTimeString,
  getWeekBounds,
  ordinal,
  toLocalISOString,
} from "@/src/utils/dateTimeUtils";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const DEFAULT_BOOKING_LOCK_HOURS = 24;
const RETROACTIVE_RESEQUENCE_LOOKAHEAD_DAYS = 180;
const RECOMMENDATION_LOOKAHEAD_DAYS = 180;

const parseLocalDate = (dateString: string): Date => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const confirmAsync = (title: string, message: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Confirm & Book", onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

interface SessionBookingModalProps {
  visible: boolean;
  availability: Availability | null;
  /** Instructor "unavailable" rows that apply to the selected date. */
  unavailableBlocks?: Availability[];
  selectedDate: string;
  instructorId: number;
  onClose: () => void;
  onBookingSuccess: (session: SessionDetailed) => void;
}

export default function SessionBookingModal({
  visible,
  availability,
  unavailableBlocks = [],
  selectedDate,
  instructorId,
  onClose,
  onBookingSuccess,
}: SessionBookingModalProps) {
  const { user } = useAuth();
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [bookingLockHours, setBookingLockHours] = useState<number>(
    DEFAULT_BOOKING_LOCK_HOURS
  );
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [weeksMissed, setWeeksMissed] = useState(0);
  const [programCadence, setProgramCadence] = useState<ProgramCadence>("WEEKLY");
  const [cadenceAnchorWeekStart, setCadenceAnchorWeekStart] = useState<string | null>(null);
  const [trackSessions, setTrackSessions] = useState<SessionDetailed[]>([]);
  const [sessionsInGapRange, setSessionsInGapRange] = useState<SessionDetailed[] | null>(null);

  useEffect(() => {
    setSelectedStartTime("");
  }, [availability?.id, selectedDate]);

  useEffect(() => {
    if (!visible || !user?.company_id) return;
    companyService
      .getCompany(user.company_id)
      .then((res) => {
        if (res.success && typeof res.data?.booking_lock_hours === "number") {
          setBookingLockHours(res.data.booking_lock_hours);
        }
      })
      .catch(() => {});
  }, [visible, user?.company_id]);

  const resetTrack = () => {
    setCourseTitle(null);
    setCurrentWeek(null);
    setSelectedWeek(1);
    setWeeksMissed(0);
    setTrackSessions([]);
    setProgramCadence("WEEKLY");
    setCadenceAnchorWeekStart(null);
  };

  useEffect(() => {
    if (!visible) {
      resetTrack();
      setSessionsInGapRange(null);
      setSelectedStartTime("");
      return;
    }
    const currentWeekStart = getWeekBounds(new Date()).startDate;
    Promise.all([
      courseService.getMyEnrolledCourse(),
      sessionService.getMyCalendarSessions({
        start_date: currentWeekStart,
        end_date: addDays(currentWeekStart, RECOMMENDATION_LOOKAHEAD_DAYS),
        include_completed: true,
      }),
      paymentService.getSubscriptionStatus().catch(() => null),
    ]).then(([courseRes, sessionsRes, subStatus]) => {
      const enrollment = courseRes.success ? courseRes.data : null;
      if (!enrollment || enrollment.current_week == null) {
        resetTrack();
        return;
      }
      setCourseTitle(enrollment.course?.title ?? null);
      setWeeksMissed(typeof enrollment.weeks_missed === "number" ? enrollment.weeks_missed : 0);
      setProgramCadence(enrollment.program_cadence === "BIWEEKLY" ? "BIWEEKLY" : "WEEKLY");
      setCadenceAnchorWeekStart(
        resolveAnchorWeekStart(
          enrollment.cadence_anchor_date,
          subStatus?.current_period_start ?? enrollment.enrolled_at,
          currentWeekStart
        )
      );
      const nextWeek =
        typeof enrollment.next_week_to_book === "number"
          ? enrollment.next_week_to_book
          : enrollment.current_week;
      setCurrentWeek(nextWeek);
      setSelectedWeek(nextWeek);
      setTrackSessions(sessionsRes.success && sessionsRes.data ? sessionsRes.data : []);
    }).catch(resetTrack);
  }, [visible]);

  useEffect(() => {
    if (!visible || !selectedDate) {
      setSessionsInGapRange(null);
      return;
    }
    const currentWeekBounds = getWeekBounds(new Date());
    const bookingWeekBounds = getWeekBounds(parseLocalDate(selectedDate));
    if (bookingWeekBounds.startDate <= currentWeekBounds.startDate) {
      setSessionsInGapRange(null);
      return;
    }
    sessionService
      .getMyCalendarSessions({
        start_date: currentWeekBounds.startDate,
        end_date: bookingWeekBounds.endDate,
        include_completed: true,
      })
      .then((res) => setSessionsInGapRange(res.success && res.data ? res.data : null))
      .catch(() => setSessionsInGapRange(null));
  }, [visible, selectedDate]);

  const buildTrackContext = (
    currentWeekStart: string,
    sessionsForTrack: SessionDetailed[] = []
  ): BookingTrackContext => ({
    currentWeekStart,
    cadence: programCadence,
    anchorWeekStart: cadenceAnchorWeekStart || currentWeekStart,
    baselineWeeksMissed: weeksMissed,
    weeksWithSession: buildWeeksWithSession(sessionsForTrack),
  });

  /** Mirrors the web booking-track gates; returns false when the student backs out or is blocked. */
  const passesTrackChecks = async (startTime: string): Promise<boolean> => {
    if (currentWeek == null) return true;
    const bookingWeekBounds = getWeekBounds(parseLocalDate(selectedDate));
    const currentWeekBounds = getWeekBounds(new Date());
    const bookingIsLaterWeek = bookingWeekBounds.startDate > currentWeekBounds.startDate;
    const context = buildTrackContext(currentWeekBounds.startDate);

    if (programCadence === "BIWEEKLY") {
      const recommendedStart = resolveRecommendedWeekStart(currentWeek, context);
      const allowed =
        bookingWeekBounds.startDate === recommendedStart &&
        isExpectedWeek(bookingWeekBounds.startDate, "BIWEEKLY", context.anchorWeekStart);
      if (!allowed) {
        Alert.alert(
          "Bi-weekly booking window",
          `Week ${currentWeek} must be booked between ${formatDateString(recommendedStart)} and ${formatDateString(addDays(recommendedStart, 6))}.`
        );
        return false;
      }
    }

    if (!bookingIsLaterWeek) return true;

    const bookingStart = getSlotStart(selectedDate, startTime).getTime();
    const futureRes = await sessionService.getMyCalendarSessions({
      start_date: bookingWeekBounds.startDate,
      end_date: addDays(bookingWeekBounds.endDate, RETROACTIVE_RESEQUENCE_LOOKAHEAD_DAYS),
      include_completed: true,
    });
    const outOfOrder = (futureRes.success && futureRes.data ? futureRes.data : []).filter((s) => {
      const status = s.status?.toLowerCase();
      return (
        (status === "scheduled" || status === "in_progress") &&
        typeof s.week_number === "number" &&
        s.week_number < currentWeek &&
        new Date(s.start_time).getTime() > bookingStart
      );
    });
    if (outOfOrder.length > 0) {
      const shiftToWeek = Math.min(...outOfOrder.map((s) => s.week_number as number));
      return confirmAsync(
        "Booking in a skipped week",
        `This date is in a week you previously skipped. Booking here will make this session week ${shiftToWeek} and shift ${outOfOrder.length} later booked session${outOfOrder.length === 1 ? "" : "s"} forward by one class so your schedule stays in order.`
      );
    }

    const prevRes = await sessionService.getMyCalendarSessions({
      start_date: currentWeekBounds.startDate,
      end_date: bookingWeekBounds.endDate,
      include_completed: true,
    });
    const sessionsBeforeBooking = (prevRes.success && prevRes.data ? prevRes.data : []).filter((s) => {
      const status = s.status?.toLowerCase();
      return status === "scheduled" || status === "in_progress" || status === "completed";
    });
    const projection = projectMissCountForBooking(
      buildTrackContext(currentWeekBounds.startDate, sessionsBeforeBooking),
      bookingWeekBounds.startDate
    );
    if (projection.addedMissedCount > 0) {
      return confirmAsync(
        "Skipping a week",
        `You don't have a session in the week before this one. This will count as a missed week. This will be your ${ordinal(projection.newMissedCount)} miss out of ${MAX_MISSED_WEEKS_ALLOWED} allowable misses. Missing more than ${MAX_MISSED_WEEKS_ALLOWED} will result in additional charges to finish the course.`
      );
    }
    return true;
  };

  const generateTimeSlots = () => {
    if (!availability) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = availability.start_time
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.end_time.split(":").map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    const SLOT_DURATION = 60;
    const SLOT_INTERVAL = 60;

    for (
      let time = startTimeMinutes;
      time + SLOT_DURATION <= endTimeMinutes;
      time += SLOT_INTERVAL
    ) {
      const slotStartHour = Math.floor(time / 60);
      const slotStartMinute = time % 60;

      const timeString = `${slotStartHour
        .toString()
        .padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`;
      const blocked = unavailableBlocks.some(
        (block) =>
          block.instructor_id === availability.instructor_id &&
          timeToMinutes(block.start_time) <= time &&
          timeToMinutes(block.end_time) >= time + SLOT_DURATION
      );
      if (!blocked) slots.push(timeString);
    }
    return slots;
  };

  const getSlotStart = (dateString: string, timeString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  /** Mirrors the backend rule rejecting bookings that start within booking_lock_hours. */
  const isSlotLocked = (dateString: string, timeString: string): boolean =>
    getSlotStart(dateString, timeString).getTime() <=
    Date.now() + bookingLockHours * 60 * 60 * 1000;

  const calculateEndTime = (startTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endTimeMinutes = startHour * 60 + startMinute + 60;
    const endHour = Math.floor(endTimeMinutes / 60);
    const endMinute = endTimeMinutes % 60;
    return `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;
  };

  const isTimeSlotInPast = (dateString: string, timeString: string): boolean => {
    try {
        const [year, month, day] = dateString.split("-").map(Number);
        const [hours, minutes] = timeString.split(":").map(Number);
        const slotDateTime = new Date(year, month - 1, day, hours, minutes);

        return slotDateTime < new Date();
    } catch (error) {
        console.error("Error checking time:", error)
        return false;
    }
  }

  const handleBookSession = async () => {
    if (!selectedStartTime || !availability) {
      Alert.alert("Error", "Missing required information to book the session.");
      return;
    }

    if (isTimeSlotInPast(selectedDate, selectedStartTime)) {
        Alert.alert(
            "Time Not Available",
            "This time slot has already passed. Please select a future time slot.",
            [{ text: "OK", onPress: () => setSelectedStartTime("")}]
        );
        return;
    }
    if (isSlotLocked(selectedDate, selectedStartTime)) {
        Alert.alert(
            "Time Not Available",
            `Sessions must be booked at least ${bookingLockHours} hours in advance. Please select a later time slot.`,
            [{ text: "OK", onPress: () => setSelectedStartTime("")}]
        );
        return;
    }
    setIsBooking(true);
    try {
      if (!(await passesTrackChecks(selectedStartTime))) return;
      const endTime = calculateEndTime(selectedStartTime);
      const [y, m, d] = selectedDate.split("-").map(Number);
      const [startH, startMin] = selectedStartTime.split(":").map(Number);
      const [endH, endMin] = endTime.split(":").map(Number);
      const startDateObj = new Date(y, m - 1, d, startH, startMin, 0);
      const endDateObj = new Date(y, m - 1, d, endH, endMin, 0);
      const bookingData: DirectBookingRequest = {
        instructor_id: instructorId,
        title: `Training Session`,
        description: `Scheduled training session`,
        start_time: toLocalISOString(startDateObj),
        end_time: toLocalISOString(endDateObj),
        ...(currentWeek != null && { week_number: selectedWeek }),
      };

      const response = await sessionService.bookDirectSession(bookingData);

      if (response.success && response.data) {
        Alert.alert("Success", "Training session booked successfully!");
        onBookingSuccess(response.data);
        onClose();
      } else {
        const errorMessage = response.error || "Failed to book the session";

        if (errorMessage.includes("future") || errorMessage.includes("start_time")) {
            Alert.alert(
                "Time Not Available",
                "This time slot is no longer available. Please select a different time."
            );
        } else {
            Alert.alert("Booking Error", errorMessage);
        }
      }
    } catch (error) {
      console.error("Error booking session:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsBooking(false);
    }
  };

  const timeSlots = generateTimeSlots();

  const nowWeekStart = getWeekBounds(new Date()).startDate;
  const stayOnTrackHint = (() => {
    if (!courseTitle || currentWeek == null) return null;
    const context = buildTrackContext(nowWeekStart, trackSessions);
    const recommendedStart = resolveRecommendedWeekStart(currentWeek, context);
    const intervalWeeks = programCadence === "BIWEEKLY" ? 2 : 1;
    const weeksFromAnchor = Math.round(
      (parseLocalDate(recommendedStart).getTime() - parseLocalDate(context.anchorWeekStart).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    return {
      weekNumber: Math.max(1, Math.floor(weeksFromAnchor / intervalWeeks) + 1),
      start: recommendedStart,
      end: addDays(recommendedStart, 6),
    };
  })();

  const missedWeeksWarning = (() => {
    if (currentWeek == null || sessionsInGapRange === null || !selectedDate) return null;
    const bookingWeekStart = getWeekBounds(parseLocalDate(selectedDate)).startDate;
    if (bookingWeekStart <= nowWeekStart) return null;
    const projection = projectMissCountForBooking(
      buildTrackContext(nowWeekStart, sessionsInGapRange),
      bookingWeekStart
    );
    if (projection.addedMissedCount === 0) return null;
    const { skippedWeekNumbers, newMissedCount, addedMissedCount } = projection;
    return {
      title: addedMissedCount === 1 ? "Missed week" : "Missed weeks",
      label:
        skippedWeekNumbers.length === 1
          ? `week ${skippedWeekNumbers[0]}`
          : `weeks ${skippedWeekNumbers.join(", ")}`,
      newMissedCount,
      exceededMax: newMissedCount > MAX_MISSED_WEEKS_ALLOWED,
    };
  })();

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book Training Session</Text>
          {currentWeek != null && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.modalText}>Your next class:</Text>
              <Text style={[styles.modalText, { color: themes.vegasGold }]}>
                {courseTitle ? `${courseTitle}, ` : ""}Week {selectedWeek}
              </Text>
              {stayOnTrackHint && (
                <Text style={[styles.modalText, { fontSize: 13, opacity: 0.8 }]}>
                  Stay on track: schedule week {stayOnTrackHint.weekNumber} between{" "}
                  {formatDateString(stayOnTrackHint.start)} and {formatDateString(stayOnTrackHint.end)}.
                </Text>
              )}
            </View>
          )}
          {missedWeeksWarning && (
            <View
              accessibilityRole="alert"
              style={{
                borderWidth: 1,
                borderColor: "rgba(248, 113, 113, 0.6)",
                backgroundColor: "rgba(248, 113, 113, 0.12)",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.modalText, { fontWeight: "700", marginBottom: 4 }]}>
                {missedWeeksWarning.title}
              </Text>
              <Text style={[styles.modalText, { fontSize: 13 }]}>
                Booking for this date means you won&apos;t have a session for {missedWeeksWarning.label}. This
                would be your {ordinal(missedWeeksWarning.newMissedCount)} miss out of {MAX_MISSED_WEEKS_ALLOWED}{" "}
                allowable misses.
              </Text>
              <Text style={[styles.modalText, { fontSize: 13, opacity: 0.8, marginTop: 4 }]}>
                {missedWeeksWarning.exceededMax
                  ? "You've exceeded the max number of missed weeks that can be made up for free. Additional sessions may incur extra cost."
                  : `You can miss up to ${MAX_MISSED_WEEKS_ALLOWED} weeks; those can be made up in the grace period. After that, additional sessions may incur extra cost.`}
              </Text>
            </View>
          )}
          <Text style={styles.modalText}>
            Available: {formatTimeString(availability?.start_time || "")} - {formatTimeString(availability?.end_time || "")}
          </Text>
          <Text style={[styles.modalText, { fontSize: 18, marginBottom: 8 }]}>
            Select a 1-hour time slot:
          </Text>
          {bookingLockHours > 0 && (
            <Text style={[styles.modalText, { fontSize: 13, opacity: 0.7, marginBottom: 12 }]}>
              Sessions must be booked at least {bookingLockHours} hour
              {bookingLockHours === 1 ? "" : "s"} in advance.
            </Text>
          )}

          <ScrollView style={{ maxHeight: 300, flexShrink: 1, marginBottom: 20 }}>
            {timeSlots.length === 0 && (
              <Text style={styles.sessionText}>No open time slots for this date.</Text>
            )}
            {timeSlots.map((startTime, index) => {
              const endTime = calculateEndTime(startTime);
              const formattedStartTime = formatTimeString(startTime);
              const formattedEndTime = formatTimeString(endTime);
              const isPast = isTimeSlotInPast(selectedDate, startTime);
              const isLocked = !isPast && isSlotLocked(selectedDate, startTime);
              const isUnbookable = isPast || isLocked;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sessionCard,
                    selectedStartTime === startTime &&
                      styles.sessionCardSelected,
                    isUnbookable && { opacity: 0.45 },
                  ]}
                  onPress={() => setSelectedStartTime(startTime)}
                  disabled={isUnbookable}
                >
                  <Text style={styles.sessionText}>
                    {formattedStartTime} - {formattedEndTime}
                    {isPast ? "  (passed)" : isLocked ? "  (too soon to book)" : ""}
                  </Text>
                  {selectedStartTime === startTime && (
                    <View style={styles.selectionIndicator}>
                      <Text style={styles.selectionIndicatorText}>
                        Selected
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor: themes.black,
                  borderWidth: 1,
                  borderColor: themes.vegasGold,
                },
              ]}
              onPress={onClose}
              disabled={isBooking}
            >
              <Text style={[styles.modalButtonText, { color: themes.white }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: themes.vegasGold },
                (!selectedStartTime || isBooking) && { opacity: 0.7 },
              ]}
              onPress={handleBookSession}
              disabled={!selectedStartTime || isBooking}
            >
              {isBooking ? (
                <ActivityIndicator color={themes.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: themes.white }]}>
                  Book Session
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
