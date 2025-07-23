import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CreateEventRequest } from "@/src/types/event.types";
import { calendarScreenStyles as styles } from "@/src/styles/calendarScreen";
import { themes } from "@/src/context/themes";

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

  useEffect(() => {
    if (visible) {
      const baseDateTime = selectedDate ? new Date(selectedDate) : new Date();
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
      });
      setErrors({});
    }
  }, [visible, selectedDate]);

  const handleChange = (field: keyof CreateEventRequest, value: string) => {
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
    return new Date(isoString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <Text style={styles.modalText}>Event Title</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              maxLength={255}
              placeholder="Enter Event Title"
              placeholderTextColor={themes.white}
              style={[
                styles.modalTextInput,
                errors.title && {
                  borderColor: "#FF4444",
                  borderWidth: 1,
                },
              ]}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <TextInput
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              maxLength={500}
              placeholder="Event Description"
              placeholderTextColor={themes.white}
              multiline={true}
              numberOfLines={3}
              style={[
                styles.modalTextInput,
                { height: 80, textAlignVertical: "top" },
                errors.description && {
                  borderColor: "#FF4444",
                  borderWidth: 1,
                },
              ]}
            />
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
                  ? formData.start_time.toLocaleString()
                  : "Select Start Time"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={
                  formData.start_time ? new Date(formData.start_time) : new Date()
                }
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, time) => {
                  setShowStartPicker(false);
                  if (time) {
                    handleChange("start_time", time.toISOString());
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            {errors.start_time && (
              <Text style={styles.errorText}>{errors.start_time}</Text>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.end_time
                  ? formData.end_time.toLocaleString()
                  : "Select End Time"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={
                  formData.end_time ? new Date(formData.end_time) : new Date()
                }
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, time) => {
                  setShowEndPicker(false);
                  if (time) {
                    handleChange("end_time", time.toISOString());
                  }
                }}
                minimumDate={
                  formData.start_time ? new Date(formData.start_time) : new Date()
                }
              />
            )}
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
    </Modal>
  );
};

export default CreateEventModal;
