import { themes } from "@/src/context/themes";
import { instructorAvailabilityService } from "@/src/services/instructorAvailabilityService";
import { instructorAvailablityModal as styles } from "@/src/styles/CalendarPageStyles/InstructorCalendar/instructorAvailabilityModal";
import {
  TimeOffConflictDetail,
  TimeOffRequest,
  TimeOffScope,
} from "@/src/types/availability.types";
import {
  createLocalDate,
  formatDateString,
  formatTimeString,
} from "@/src/utils/dateTimeUtils";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SLOT_HOURS = 1;

const SCOPES: { key: TimeOffScope; label: string }[] = [
  { key: "whole_day", label: "Whole day" },
  { key: "slot", label: "One hour" },
  { key: "date_range", label: "Date range" },
];

function addOneHour(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + SLOT_HOURS * 60;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatSessionLine(s: { title: string; start_time: string; student_name?: string | null }) {
  const t = new Date(s.start_time).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const who = s.student_name ? ` — ${s.student_name}` : "";
  return `${t} · ${s.title}${who}`;
}

type PickerTarget = "day" | "rangeEnd" | "slot" | null;

type TimeOffModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Default day from the calendar selection (YYYY-MM-DD). */
  selectedDate: string;
  /** When set, time off is applied for this instructor (admin / delegated instructor). */
  instructorId?: number | null;
  instructorName?: string;
  onSuccess: (cancelledSessionCount: number) => void;
};

const TimeOffModal: React.FC<TimeOffModalProps> = ({
  visible,
  onClose,
  selectedDate,
  instructorId,
  instructorName,
  onSuccess,
}) => {
  const [scope, setScope] = useState<TimeOffScope>("whole_day");
  const [dayDate, setDayDate] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [slotTime, setSlotTime] = useState("09:00");
  const [cancelBooked, setCancelBooked] = useState(false);
  const [scheduledConflict, setScheduledConflict] = useState<TimeOffConflictDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picker, setPicker] = useState<PickerTarget>(null);

  useEffect(() => {
    if (!visible) return;
    const day = selectedDate || toDateKey(new Date());
    setDayDate(day);
    setRangeEnd(day);
    setScope("whole_day");
    setSlotTime("09:00");
    setCancelBooked(false);
    setScheduledConflict(null);
    setError(null);
    setPicker(null);
  }, [visible, selectedDate]);

  const buildRequest = (cancel_affected_sessions: boolean): TimeOffRequest => {
    const base = { cancel_affected_sessions, instructor_id: instructorId ?? null };
    if (scope === "slot") {
      return {
        ...base,
        scope: "slot",
        start_date: dayDate,
        start_time: `${slotTime}:00`,
        end_time: `${addOneHour(slotTime)}:00`,
      };
    }
    if (scope === "date_range") {
      return { ...base, scope: "date_range", start_date: dayDate, end_date: rangeEnd };
    }
    return { ...base, scope: "whole_day", start_date: dayDate };
  };

  const submit = async (cancelOverride: boolean) => {
    setError(null);
    if (scope === "date_range" && (!rangeEnd || rangeEnd < dayDate)) {
      setError("End date must be on or after start date.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await instructorAvailabilityService.applyTimeOff(
        buildRequest(cancelOverride || cancelBooked)
      );
      if (res.success) {
        setScheduledConflict(null);
        onSuccess(res.data.cancelled_session_ids.length);
        onClose();
        return;
      }
      if ("conflict" in res) {
        if (res.conflict.code === "TIME_OFF_HAS_SCHEDULED_SESSIONS") {
          setScheduledConflict(res.conflict);
          return;
        }
        setError(res.conflict.message || "Cannot block this time.");
        return;
      }
      setError(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickerValue = (): Date => {
    if (picker === "slot") return new Date(`1970-01-01T${slotTime}:00`);
    const key = picker === "rangeEnd" ? rangeEnd : dayDate;
    return key ? createLocalDate(key) : new Date();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Block time off (PTO)</Text>
            <Text style={styles.modalText}>
              {instructorName ? `For ${instructorName}. ` : ""}Blocks normal availability for the
              chosen window so students cannot book. Recurring weekly slots stay on the schedule;
              this adds exceptions only.
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.modalCreateContainer}>
              {SCOPES.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.modalDayButton, scope === key && styles.modalDayButtonSelected]}
                  onPress={() => {
                    setScope(key);
                    setScheduledConflict(null);
                    setError(null);
                  }}
                >
                  <Text
                    style={[styles.modalDayText, scope === key && styles.modalDayTextSelected]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalText}>{scope === "date_range" ? "From" : "Date"}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setPicker("day")}>
              <Text style={styles.modalButtonText}>
                {dayDate ? formatDateString(dayDate) : "Select date"}
              </Text>
            </TouchableOpacity>

            {scope === "date_range" && (
              <>
                <Text style={styles.modalText}>Through</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setPicker("rangeEnd")}>
                  <Text style={styles.modalButtonText}>
                    {rangeEnd ? formatDateString(rangeEnd) : "Select end date"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {scope === "slot" && (
              <>
                <Text style={styles.modalText}>Start time (1-hour block)</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setPicker("slot")}>
                  <Text style={styles.modalButtonText}>
                    {formatTimeString(slotTime)} – {formatTimeString(addOneHour(slotTime))}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {picker && (
              <DateTimePicker
                value={pickerValue()}
                mode={picker === "slot" ? "time" : "date"}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, date) => {
                  const target = picker;
                  setPicker(null);
                  if (!date) return;
                  if (target === "slot") setSlotTime(toTimeKey(date));
                  else if (target === "rangeEnd") setRangeEnd(toDateKey(date));
                  else setDayDate(toDateKey(date));
                  setScheduledConflict(null);
                }}
              />
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}>
              <Switch
                value={cancelBooked}
                onValueChange={(v) => {
                  setCancelBooked(v);
                  if (v) setScheduledConflict(null);
                }}
                trackColor={{ true: themes.vegasGold }}
              />
              <Text style={[styles.modalText, { flex: 1, marginLeft: 10 }]}>
                If there are scheduled sessions in this window, cancel them and email students to
                reschedule.
              </Text>
            </View>

            {scheduledConflict && scheduledConflict.sessions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.modalTitle}>Booked sessions in this window</Text>
                {scheduledConflict.sessions.map((s) => (
                  <Text key={s.id} style={styles.modalText}>
                    • {formatSessionLine(s)}
                  </Text>
                ))}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "red" }]}
                    disabled={isSubmitting}
                    onPress={() => void submit(true)}
                  >
                    <Text style={styles.modalButtonText}>Cancel those & block</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setScheduledConflict(null)}
                  >
                    <Text style={styles.modalButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => void submit(false)}
                disabled={isSubmitting || (!!scheduledConflict && !cancelBooked)}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={themes.vegasGold} />
                ) : (
                  <Text style={styles.modalButtonText}>Block time off</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TimeOffModal;
