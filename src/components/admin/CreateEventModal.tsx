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
  onClose: () => void;
  onSubmit: (event: CreateEventRequest) => void;
};

const CreateEventModal: React.FC<modalProps> = ({
  visible,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      });
      setErrors({});
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

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
    } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Event title must be at least 2 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
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
            <TextInput
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              maxLength={255}
              placeholder="Event Title"
              style={[
                styles.modalTextInput,
                errors.title && { borderColor: "#FF4444", borderWidth: 1 },
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
              style={[
                styles.modalTextInput,
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
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.startTime
                  ? formData.startTime.toLocaleString()
                  : "Select Start Time"}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date(formData.startTime) || new Date()}
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, time) => {
                  setShowStartPicker(false);
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
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.modalButtonText}>
                {formData.endTime
                  ? formData.endTime.toLocaleString()
                  : "Select End Time"}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date(formData.endTime) || new Date()}
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, time) => {
                  setShowEndPicker(false);
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
    </Modal>
  );
};

export default CreateEventModal;
