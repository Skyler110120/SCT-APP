import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { masterAdminManageCourses as styles } from "@/src/styles/masterAdminManageCourses";
import {
  CourseAdminView,
  CourseVideo,
  VideoCreateRequest,
  VideoUpdateRequest,
} from "@/src/types/course.types";
import { themes } from "@/src/context/themes";
import { set } from "date-fns";

interface VideoFormProps {
  visible: boolean;
  video?: CourseVideo | null;
  course: CourseAdminView;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateVideo?: (video: VideoCreateRequest) => Promise<void>;
  onUpdateVideo?: (video: VideoUpdateRequest) => Promise<void>;
}

export default function VideoForm({
  visible,
  video,
  course,
  isSubmitting,
  onClose,
  onCreateVideo,
  onUpdateVideo,
}: VideoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [weekNumber, setWeekNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = video !== null && video !== undefined;

  const getSuggestedOrderIndex = () => {
    if (course.videos.length === 0) return "1";
    const maxOrder = Math.max(...course.videos.map((v) => v.order_index));
    return (maxOrder + 1).toString();
  };

  useEffect(() => {
    if (visible) {
      if (isEditMode && video) {
        setTitle(video.title);
        setDescription(video.description || "");
        setVideoUrl(video.video_url);
        setOrderIndex(video.order_index.toString());
        setWeekNumber(video.week_number?.toString() || "");
      } else {
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setOrderIndex(getSuggestedOrderIndex());
        setWeekNumber("");
      }
      setErrors({});
    }
  }, [visible, isEditMode, video, course.videos]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Video title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Video title must be at least 3 characters";
    }

    if (!videoUrl.trim()) {
      newErrors.videoUrl = "Video URL is required";
    } else if (!isValidUrl(videoUrl)) {
      newErrors.videoUrl = "Please enter a valid URL";
    }

    const orderNum = parseInt(orderIndex);
    if (isNaN(orderNum) || orderNum < 1) {
      newErrors.orderIndex = "Order must be a positive number";
    } else {
      const existingVideo = course.videos.find(
        (video) =>
          video.order_index === orderNum &&
          (!isEditMode || video.id !== video?.id)
      );
      if (existingVideo) {
        newErrors.orderIndex = "This order position is already taken";
      }
    }

    if (weekNumber) {
      const weekNum = parseInt(weekNumber);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 24) {
        newErrors.weekNumber = "Week number must be between 1 and 24";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please correct the errors and try again."
      );
      return;
    }
    try {
      if (isEditMode && onUpdateVideo) {
        const updateData: VideoUpdateRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          video_url: videoUrl.trim(),
          order_index: parseInt(orderIndex),
          week_number: weekNumber ? parseInt(weekNumber) : undefined,
        };

        console.log("Updating video:", updateData);
        await onUpdateVideo(updateData);
      } else if (!isEditMode && onCreateVideo) {
        const createData: VideoCreateRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          video_url: videoUrl.trim(),
          order_index: parseInt(orderIndex),
          week_number: weekNumber ? parseInt(weekNumber) : undefined,
        };

        console.log("Creating video:", createData);
        await onCreateVideo(createData);
      }
    } catch (error) {
      console.error("Error submitting video:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const weekOptions = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: "90%" }]}>
          <Text style={styles.modalTitle}>
            {isEditMode ? "Edit Video" : "Add New Video"}
          </Text>

          <Text style={styles.description}>Course: {course.title}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Video Title *</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.title && { borderColor: "#FF4444" },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter video title..."
                placeholderTextColor={themes.white}
                maxLength={200}
              />
              {errors.title && (
                <Text style={styles.warningText}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={styles.searchInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter video description..."
                placeholderTextColor={themes.white}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Video URL *</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.videoUrl && { borderColor: "#FF4444" },
                ]}
                value={videoUrl}
                onChangeText={setVideoUrl}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={themes.white}
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.videoUrl && (
                <Text style={styles.warningText}>{errors.videoUrl}</Text>
              )}
              <Text style={styles.inputDescription}>
                Youtube, Vimeo, or direct video file URL
              </Text>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Display Order *</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.orderIndex && { borderColor: "#FF4444" },
                ]}
                value={orderIndex}
                onChangeText={setOrderIndex}
                placeholder="Enter display order..."
                placeholderTextColor={themes.white}
                keyboardType="numeric"
                maxLength={3}
              />
              {errors.orderIndex && (
                <Text style={styles.warningText}>{errors.orderIndex}</Text>
              )}
              <Text style={styles.inputDescription}>
                Order in which this video appears in the course
              </Text>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Week Assignment (Optional)</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={weekNumber}
                  onValueChange={(itemValue) => setWeekNumber(itemValue)}
                  style={styles.modalPicker}
                  dropdownIconColor={themes.vegasGold}
                >
                  <Picker.Item label="No specific week" value="" />
                  {weekOptions.map((week) => (
                    <Picker.Item
                      key={week}
                      label={`Week ${week}`}
                      value={week.toString()}
                    />
                  ))}
                </Picker>
              </View>
              {errors.weekNumber && (
                <Text style={styles.warningText}>{errors.weekNumber}</Text>
              )}
              <Text style={styles.inputDescription}>
                Assign video to a specific week (1-24) or leave unassigned
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color={themes.white} />
                  <Text style={styles.savingText}>
                    {isEditMode ? "Updating..." : "Adding..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update Video" : "Add Video"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
