import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { calendarScreenStyles as styles } from "@/src/styles/calendarScreen";
import { themes } from "@/src/context/themes";
import {
  CreateAvailabilityRequest,
  Availability,
  AvailabilityUpdate,
} from "@/src/types/availability.types";
import DateTimePicker from "@react-native-community/datetimepicker";

type AvailabilityModalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  availabilities: Availability[];
  mode: "create" | "edit" | "delete";
  selectedAvailability?: Availability | null;
  onClose: () => void;
  onCreate?: (availability: CreateAvailabilityRequest) => void;
  onDelete?: (availabilityId: number) => void;
  onEdit?: (
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
  onEdit,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [formData, setFormData] = useState<
    Omit<CreateAvailabilityRequest, "dayOfWeek">
  >({
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<{
    startTime?: string;
    endTime?: string;
    dayOfWeek?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && selectedAvailability) {
        setSelectedDays([selectedAvailability.dayOfWeek]);
        setFormData({
          startTime: selectedAvailability.startTime,
          endTime: selectedAvailability.endTime,
          startDate: selectedAvailability.startDate,
          endDate: selectedAvailability.endDate || "",
        });
      } else {
        setSelectedDays([]);
        setFormData({
          startTime: "",
          endTime: "",
          startDate: "",
          endDate: "",
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
      startTime?: string;
      endTime?: string;
      startDate?: string;
      endDate?: string;
      dayOfWeek?: string;
    } = {};

    if (selectedDays.length === 0) {
      newErrors.dayOfWeek = "At least one day of the week must be selected";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDaySelect = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    );
  };
  const handleSubmit = () => {
    if (validateForm()) {
      if (mode === "edit" && selectedAvailability && onEdit) {
        const updateAvailability: AvailabilityUpdate = {
          startTime: formData.startTime,
          endTime: formData.endTime,
          startDate: formData.startDate,
          endDate: formData.endDate,
          dayOfWeek: selectedDays[0],
        };
        onEdit(selectedAvailability.id, updateAvailability);
      } else if (mode === "create" && onCreate) {
        selectedDays.forEach((day) => {
          const newAvailability: CreateAvailabilityRequest = {
            dayOfWeek: day,
            ...formData,
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
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleDelete(selectedAvailability.id)}
                >
                  <Text style={styles.modalButtonText}>Confirm Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
          {mode === "edit" && selectedAvailability ? (
            <Text style={styles.modalTitle}>
              Edit Availability for{" "}
              {daysOfWeek[selectedAvailability.dayOfWeek].label}
            </Text>
          ) : (
            <Text style={styles.modalTitle}>Set Availability</Text>
          )}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.modalTitle}>Your Current Availabilites:</Text>
            {availabilities.length > 0 ? (
              <Text style={styles.modalText}>No availabilities set.</Text>
            ) : (
              availabilities.map((availability, index) => (
                <View
                  key={availability.id || index}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={styles.modalText}>
                    {
                      daysOfWeek.find(
                        (day) => day.value === availability.dayOfWeek
                      )?.label
                    }
                    :{" "}
                    {new Date(availability.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {new Date(availability.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({new Date(availability.startDate).toLocaleDateString()}
                    {availability.endDate
                      ? ` - ${new Date(
                          availability.endDate
                        ).toLocaleDateString()}`
                      : ""}
                    )
                  </Text>
                </View>
              ))
            )}
          </View>
          <Text style={styles.modalText}>Select Day of Week</Text>
          <View style={styles.modalDayContainer}>
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
          {errors.dayOfWeek && (
            <Text style={styles.modalText}>{errors.dayOfWeek}</Text>
          )}
          <Text style={styles.modalText}>Select Start and End Date</Text>
          <Text style={styles.modalText}>End Date is Optional</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.startDate
                  ? new Date(formData.startDate).toLocaleDateString()
                  : "Select Start Date"}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={
                  formData.startDate ? new Date(formData.startDate) : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, date) => {
                  setShowStartDatePicker(false);
                  if (date) {
                    handleChange("startDate", date.toLocaleTimeString());
                  }
                }}
              />
            )}
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.endDate
                  ? new Date(formData.endDate).toLocaleDateString()
                  : "Select End Date (Optional)"}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={
                  formData.endDate ? new Date(formData.endDate) : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, date) => {
                  setShowEndDatePicker(false);
                  if (date) {
                    handleChange("endDate", date.toISOString());
                  }
                }}
              />
            )}
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
            )}
          </View>
          <Text style={styles.modalText}>Select Start and End Time</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.startTime
                  ? formData.startTime.toLocaleString()
                  : "Select Start Time"}
                ;
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={new Date(formData.startTime) || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, time) => {
                  setShowStartTimePicker(false);
                  if (time) {
                    handleChange("startTime", time.toISOString());
                  }
                }}
              />
            )}
            {errors.startTime && (
              <Text style={styles.errorText}>{errors.startTime}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.endTime
                  ? formData.endTime.toLocaleString()
                  : "Select End Time"}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={new Date(formData.endTime) || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, time) => {
                  setShowEndTimePicker(false);
                  if (time) {
                    handleChange("endTime", time.toISOString());
                  }
                }}
              />
            )}
            {errors.endTime && (
              <Text style={styles.errorText}>{errors.endTime}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={themes.vegasGold} />
            ) : (
              <Text style={styles.modalButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InstructorAvailabilityModal;
