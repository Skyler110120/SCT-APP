import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { sessionService } from "@/src/services/sessionService";
import { bookingModalStyles as styles } from "@/src/styles/CalendarPageStyles/StudentCalendar/bookingModalStyles";
import { Availability } from "@/src/types/availability.types";
import {
    DirectBookingRequest,
    SessionDetailed,
} from "@/src/types/sessions.types";
import { formatTimeString } from "@/src/utils/dateTimeUtils";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SessionBookingModalProps {
  visible: boolean;
  availability: Availability | null;
  selectedDate: string;
  instructorId: number;
  onClose: () => void;
  onBookingSuccess: (session: SessionDetailed) => void;
}

export default function SessionBookingModal({
  visible,
  availability,
  selectedDate,
  instructorId,
  onClose,
  onBookingSuccess,
}: SessionBookingModalProps) {
  const { user } = useAuth();
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState<boolean>(false);

  const generateTimeSlots = () => {
    if (!availability) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = availability.start_time
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.end_time.split(":").map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    const SLOT_DURATION = 120;
    const SLOT_INTERVAL = 120;

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
      slots.push(timeString);
    }
    return slots;
  };

  const calculateEndTime = (startTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endTimeMinutes = startHour * 60 + startMinute + 120;
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

        const now = new Date();

        console.log("Simple time check: ", {
            now: now.toLocaleString(),
            slotTime: slotDateTime.toLocaleString(),
            isPast: slotDateTime < now
        })

        return slotDateTime < now;
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
    setIsBooking(true);
    try {
      const endTime = calculateEndTime(selectedStartTime);
      const bookingData: DirectBookingRequest = {
        instructor_id: instructorId,
        title: `Training Session`,
        description: `Scheduled training session`,
        start_time: `${selectedDate}T${selectedStartTime}:00`,
        end_time: `${selectedDate}T${endTime}:00`,
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
          <Text style={styles.modalText}>
            Available: {formatTimeString(availability?.start_time || "")} - {formatTimeString(availability?.end_time || "")}
          </Text>
          <Text style={[styles.modalText, { fontSize: 18, marginBottom: 20 }]}>
            Select a 2-hour time slot:
          </Text>

          <ScrollView style={[{ maxHeight: 300, marginBottom: 20 }]}>
            {timeSlots.map((startTime, index) => {
              const endTime = calculateEndTime(startTime);
              const formattedStartTime = formatTimeString(startTime);
              const formattedEndTime = formatTimeString(endTime);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sessionCard,
                    selectedStartTime === startTime &&
                      styles.sessionCardSelected,
                  ]}
                  onPress={() => setSelectedStartTime(startTime)}
                >
                  <Text style={styles.sessionText}>
                    {formattedStartTime} - {formattedEndTime}
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
