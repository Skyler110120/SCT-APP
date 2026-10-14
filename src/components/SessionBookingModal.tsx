import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { companyService } from "@/src/services/companyService";
import { courseService } from "@/src/services/courseService";
import { sessionService } from "@/src/services/sessionService";
import { bookingModalStyles as styles } from "@/src/styles/CalendarPageStyles/StudentCalendar/bookingModalStyles";
import { Availability } from "@/src/types/availability.types";
import {
    DirectBookingRequest,
    SessionDetailed,
} from "@/src/types/sessions.types";
import { formatTimeString, toLocalISOString } from "@/src/utils/dateTimeUtils";
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

  useEffect(() => {
    if (!visible) {
      setCurrentWeek(null);
      setSelectedWeek(1);
      setSelectedStartTime("");
      return;
    }
    courseService.getMyEnrolledCourse().then((res) => {
      if (res.success && res.data?.current_week != null) {
        const cw = res.data.current_week;
        setCurrentWeek(cw);
        setSelectedWeek(
          typeof res.data.next_week_to_book === "number" ? res.data.next_week_to_book : cw
        );
      } else {
        setCurrentWeek(null);
        setSelectedWeek(1);
      }
    }).catch(() => {
      setCurrentWeek(null);
      setSelectedWeek(1);
    });
  }, [visible]);

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

        if (errorMessage.includes("start_time must be in the future")) {
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

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book Training Session</Text>
          {currentWeek != null && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.modalText}>Course week:</Text>
              <Text style={[styles.modalText, { color: themes.vegasGold }]}>
                Week {selectedWeek}
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
