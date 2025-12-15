import { themes } from "@/src/context/themes";
import { eventModalStyles as styles } from "@/src/styles/CalendarPageStyles/AdminCalendar/eventModalStyles";
import { CreateEventRequest } from "@/src/types/event.types";
import {
  createLocalDate
} from "@/src/utils/dateTimeUtils";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type modalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSubmit: (event: CreateEventRequest) => void;
};

const CreateEventModal: React.FC<modalProps> = ({
  visible,
  isSubmitting = false,
  selectedDate,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
  }>({});

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const createDateTimeFromComponents = (dateString: string, hour: number, minute: number = 0): Date => {
    try {
      const baseDate = createLocalDate(dateString);
      const dateTime = new Date(baseDate);
      dateTime.setHours(hour, minute, 0, 0)
      return dateTime;
    } catch (error) {
      console.error("Error creating datetime:", { dateString, hour, minute}, error)
      return new Date()
    }
  }

  useEffect(() => {
    console.log("Modal opened with selected date:", selectedDate);

    if (visible && selectedDate) {
      const now = new Date();
      const baseDate = createLocalDate(selectedDate);

      let defaultHour = 9;

      if (baseDate.toDateString() === now.toDateString() && now.getHours() >= 9) {
        defaultHour = Math.min(now.getHours() + 1, 23);
      }

      const defaultStartTime = createDateTimeFromComponents(selectedDate, defaultHour, 0);
      const defaultEndTime = createDateTimeFromComponents(selectedDate, defaultHour + 1, 0);
      setFormData({
        title: "",
        description: "",
        start_time: defaultStartTime.toISOString(),
        end_time: defaultEndTime.toISOString(),
      });
      setErrors({});
    }
  }, [visible, selectedDate]);

  useEffect(() => {
    if (!visible) {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
  }, [visible]);

  const handleChange = (field: keyof CreateEventRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleStartTimeConfirm = (selectedDate: Date) => {
    handleChange("start_time", selectedDate.toISOString());
    setShowStartPicker(false);

    if (formData.end_time && new Date(formData.end_time) <= selectedDate) {
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(selectedDate.getHours() + 1);
      handleChange("end_time", newEndTime.toISOString());
    }
  };

  const handleStartTimeCancel = () => {
    setShowStartPicker(false);
  };

  const handleEndTimeConfirm = (selectedDate: Date) => {
    handleChange("end_time", selectedDate.toISOString());
    setShowEndPicker(false);
  };

  const handleEndTimeCancel = () => {
    setShowEndPicker(false);
  }

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      start_time?: string;
      end_time?: string;
    } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Event title must be at least 2 characters";
    } else if (formData.title.trim().length > 255) {
      newErrors.title = "Event title must be less than 255 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "Event description must be at least 5 characters";
    } else if (formData.description.trim().length > 500) {
      newErrors.description =
        "Event description must be less than 500 characters";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }

    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = "End time must be after start time";
    }

    const now = new Date();
    if (new Date(formData.start_time) < now) {
      newErrors.start_time = "Start time cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatDisplayTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Event</Text>
          <Text style={styles.modalText}>Fill out event details</Text>
          <View style={styles.modalTextInputContainer}>
            <View style={{width: "40%"}}>
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              maxLength={255}
              placeholder="Enter Event Title"
              placeholderTextColor={themes.white}
              textAlign="center"
              style={[
                styles.modalTextInput,
                errors.title && styles.modalErrorInput
              ]}
            />
            </View>
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <View style={{width: "60%"}}>
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              maxLength={500}
              placeholder="Event Description"
              placeholderTextColor={themes.white}
              textAlign="center"
              multiline={true}
              numberOfLines={4}
              style={[
                styles.modalTextInput,
                errors.description && styles.modalErrorInput
              ]}
            />
            </View>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>
          <Text style={styles.modalText}>Select Start and End Time</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.start_time
                  ? formatDisplayTime(formData.start_time)
                  : "Select Start Time"}
              </Text>
            </TouchableOpacity>
            {errors.start_time && (
              <Text style={styles.errorText}>{errors.start_time}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.end_time
                  ? formatDisplayTime(formData.end_time)
                  : "Select End Time"}
              </Text>
            </TouchableOpacity>
            {errors.end_time && (
              <Text style={styles.errorText}>{errors.end_time}</Text>
            )}
          </View>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
                style={styles.modalButton}
                onPress={onClose}
            >
                <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.vegasGold} />
              ) : (
                <Text style={styles.modalButtonText}>Create Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode='datetime'
        onConfirm={handleStartTimeConfirm}
        onCancel={handleStartTimeCancel}
        date={formData.start_time ? new Date(formData.start_time) : new Date()}
        minimumDate={new Date()}
        title="Select Start Time"
        cancelTextIOS="Cancel"
        confirmTextIOS="Confirm"
        isDarkModeEnabled={true}
        display={Platform.OS === "ios" ? "inline" : "default"}
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode='datetime'
        onConfirm={handleEndTimeConfirm}
        onCancel={handleEndTimeCancel}
        date={formData.end_time ? new Date(formData.end_time) : new Date()}
        minimumDate={formData.start_time ? new Date(formData.start_time) : new Date()}
        title="Select End Time"
        cancelTextIOS="Cancel"
        confirmTextIOS="Confirm"
        isDarkModeEnabled={true}
        display={Platform.OS === "ios" ? "inline" : "default"}
      />
    </Modal>
  );
};

export default CreateEventModal;
