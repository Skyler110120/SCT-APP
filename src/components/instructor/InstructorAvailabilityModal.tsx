import { themes } from "@/src/context/themes";
import { instructorAvailablityModal as styles } from "@/src/styles/CalendarPageStyles/InstructorCalendar/instructorAvailabilityModal";
import {
  Availability,
  AvailabilityUpdate,
  CreateAvailabilityRequest,
} from "@/src/types/availability.types";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createLocalDate,
  formatDateRange,
  formatDateString,
  formatTimeString
} from "@/src/utils/dateTimeUtils";

type AvailabilityModalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  availabilities: Availability[];
  mode: "create" | "edit" | "delete";
  selectedAvailability?: Availability | null;
  onClose: () => void;
  onCreate: (availability: CreateAvailabilityRequest) => void;
  onDelete: (availabilityId: number) => void;
  onUpdate: (
    availabilityId: number,
    updateAvailability: AvailabilityUpdate
  ) => void;
};

const daysOfWeek = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const InstructorAvailabilityModal: React.FC<AvailabilityModalProps> = ({
  visible,
  isSubmitting = false,
  availabilities,
  mode,
  selectedAvailability = null,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [formData, setFormData] = useState<
    Omit<CreateAvailabilityRequest, "day_of_week">
  >({
    start_time: "",
    end_time: "",
    start_date: "",
    end_date: "",
  });
  const [errors, setErrors] = useState<{
    start_time?: string;
    end_time?: string;
    day_of_week?: string;
    start_date?: string;
    end_date?: string;
  }>({});

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeToString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && selectedAvailability) {
        setSelectedDays([selectedAvailability.day_of_week]);
        setFormData({
          start_time: selectedAvailability.start_time,
          end_time: selectedAvailability.end_time,
          start_date: selectedAvailability.start_date,
          end_date: selectedAvailability.end_date || undefined,
        });
      } else {
        const today = new Date();
        const todayString = formatDateToLocalString(today);
        setSelectedDays([]);
        setFormData({
          start_time: "09:00",
          end_time: "10:00",
          start_date: todayString,
          end_date: "",
        });
      }
      setErrors({});
    }
  }, [visible, mode, selectedAvailability]);

  const handleChange = (
    field: keyof CreateAvailabilityRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      start_time?: string;
      end_time?: string;
      start_date?: string;
      end_date?: string;
      day_of_week?: string;
    } = {};

    if (selectedDays.length === 0) {
      newErrors.day_of_week = "At least one day of the week must be selected";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (formData.end_date && formData.start_date) {
      const startDate = createLocalDate(formData.start_date);
      const endDate = createLocalDate(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }

    if (formData.start_time && formData.end_time) {
      const startTime = new Date(`1970-01-01T${formData.start_time}`);
      const endTime = new Date(`1970-01-01T${formData.end_time}`);
      
      if (endTime <= startTime) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDaySelect = (dayValue: number) => {
    if (mode === "edit") return;

    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    );
  };
  const handleSubmit = () => {
    if (validateForm()) {
      if (mode === "edit" && selectedAvailability && onUpdate) {
        const updateAvailability: AvailabilityUpdate = {
          start_time: formData.start_time,
          end_time: formData.end_time,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          day_of_week: selectedDays[0],
        };
        onUpdate(selectedAvailability.id, updateAvailability);
      } else if (mode === "create" && onCreate) {
        selectedDays.forEach((day) => {
          const newAvailability: CreateAvailabilityRequest = {
            start_time: formData.start_time,
            end_time: formData.end_time,
            start_date: formData.start_date,
            end_date: formData.end_date || undefined,
            day_of_week: day,
          };
          onCreate(newAvailability);
        });
      }
    }
  };
  const handleDelete = (availabilityId: number) => {
    if (onDelete) {
      onDelete(availabilityId);
    }
  };
  
  const formateTimeString = (timeString: any) => {
    if (!timeString) return "Invalid Time";

    const tempDate = new Date(`1970-01-01T${timeString}`);

    if (isNaN(tempDate.getTime())) return "Invalid Time";

    return tempDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {mode === "delete" && selectedAvailability ? (
            <>
              <Text style={styles.modalText}>
                Are you sure you want to delete this availability
              </Text>
              <Text style={styles.modalText}>
                {daysOfWeek[selectedAvailability.day_of_week].label}{" "}
                {formateTimeString(selectedAvailability.start_time)} -{" "}
                {formateTimeString(selectedAvailability.end_time)}
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "red" }]}
                  onPress={() => handleDelete(selectedAvailability.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={themes.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {mode === "edit" && selectedAvailability ? (
                <Text style={styles.modalTitle}>
                  Edit Availability for{" "}
                  {daysOfWeek[selectedAvailability.day_of_week].label}
                </Text>
              ) : (
                <Text style={styles.modalTitle}>Set Availability</Text>
              )}

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.modalTitle}>
                  Your Current Availabilites:
                </Text>
                {availabilities.length === 0 ? (
                  <Text style={styles.modalText}>No availabilities set.</Text>
                ) : (
                  availabilities.map((availability, index) => (
                    <View
                      key={availability.id || index}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.modalText}>
                        {daysOfWeek[availability.day_of_week].label}:{" "}
                        {formatTimeString(availability.start_time)} -{" "}
                        {formatTimeString(availability.end_time)} {" "}
                        {formatDateRange(availability.start_date, availability.end_date)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
              {mode === "create" && (
                <Text style={styles.modalText}>Select Days of Week</Text>
              )}
              {mode === "edit" && selectedAvailability ? (
                <View style={styles.modalUpdateContainer}>
                  <View
                    style={[styles.modalDayButtonSelected, 
                      { width: "10%", alignItems: "center" }]}
                  >
                    <Text style={styles.modalDayTextSelected}>
                      {daysOfWeek[selectedAvailability.day_of_week].label}
                    </Text>
                  </View>
                  <Text style={styles.modalText}>
                    Day cannot be changed when editing
                  </Text>
                </View>
              ) : (
                <View style={styles.modalCreateContainer}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.modalDayButton,
                        selectedDays.includes(day.value)
                          ? styles.modalDayButtonSelected
                          : null,
                      ]}
                      onPress={() => handleDaySelect(day.value)}
                    >
                      <Text
                        style={[
                          styles.modalDayText,
                          selectedDays.includes(day.value)
                            ? styles.modalDayTextSelected
                            : null,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.day_of_week && (
                <Text style={styles.modalText}>{errors.day_of_week}</Text>
              )}
              <Text style={styles.modalText}>Select Start and End Date</Text>
              <Text style={styles.modalText}>End Date is Optional</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.modalButtonText}>
                    {formData.start_date
                      ? formatDateString(formData.start_date)
                      : "Select Start Date"}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={
                      formData.start_date
                        ? createLocalDate(formData.start_date)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => {
                      setShowStartDatePicker(false);
                      if (date) {
                        const dateString = formatDateToLocalString(date);
                        handleChange("start_date", dateString);
                      }
                    }}
                  />
                )}
                {errors.start_date && (
                  <Text style={styles.errorText}>{errors.start_date}</Text>
                )}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.modalButtonText}>
                    {formData.end_date
                      ? formatDateString(formData.end_date)
                      : "Select End Date (Optional)"}
                  </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={
                      formData.end_date
                        ? createLocalDate(formData.end_date)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => {
                      setShowEndDatePicker(false);
                      if (date) {
                        const dateString = formatDateToLocalString(date);
                        handleChange("end_date", dateString);
                      }
                    }}
                  />
                )}
                {errors.end_date && (
                  <Text style={styles.errorText}>{errors.end_date}</Text>
                )}
              </View>
              <Text style={styles.modalText}>Select Start and End Time</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.modalButtonText}>
                    {formData.start_time
                      ? formatTimeString(formData.start_time)
                      : "Select Start Time"}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={
                      formData.start_time
                        ? new Date(`1970-01-01T${formData.start_time}`)
                        : new Date()
                    }
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, time) => {
                      setShowStartTimePicker(false);
                      if (time) {
                        const timeString = formatTimeToString(time);
                        handleChange("start_time", timeString);
                      }
                    }}
                  />
                )}
                {errors.start_time && (
                  <Text style={styles.errorText}>{errors.start_time}</Text>
                )}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.modalButtonText}>
                    {formData.end_time
                      ? formatTimeString(formData.end_time)
                      : "Select End Time"}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={
                      formData.end_time
                        ? new Date(`1970-01-01T${formData.end_time}`)
                        : new Date()
                    }
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, time) => {
                      setShowEndTimePicker(false);
                      if (time) {
                        const timeString = formatTimeToString(time);
                        handleChange("end_time", timeString);
                      }
                    }}
                  />
                )}
                {errors.end_time && (
                  <Text style={styles.errorText}>{errors.end_time}</Text>
                )}
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={themes.vegasGold} />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      {mode === "edit" ? "Update" : "Create"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default InstructorAvailabilityModal;
