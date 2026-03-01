import { themes } from "@/src/context/themes";
import { videoFormStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/videoFormStyles";
import {
  CourseAdminView,
  CourseVideo,
  VideoCreateRequest,
  VideoUpdateRequest,
} from "@/src/types/course.types";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { materialService } from "@/src/services/materialService";
import * as FileSystem from "expo-file-system";
import {
  MAX_VIDEO_SIZE_BYTES,
  formatBytes,
} from "@/src/constants/uploadLimits";

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
  const [sourceType, setSourceType] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoS3Key, setVideoS3Key] = useState("");
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [videoContentType, setVideoContentType] = useState<string | null>(null);
  const [orderIndex, setOrderIndex] = useState("1");
  const [weekNumber, setWeekNumber] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
        const hasS3 = Boolean(video.video_s3_key?.trim());
        setSourceType(hasS3 ? "upload" : "url");
        setVideoUrl(video.video_url || "");
        setVideoS3Key(video.video_s3_key || "");
        setVideoFilename(video.video_filename || null);
        setVideoContentType(video.video_content_type || null);
        setOrderIndex(video.order_index.toString());
        setWeekNumber(video.week_number?.toString() || "");
      } else {
        setTitle("");
        setDescription("");
        setSourceType("url");
        setVideoUrl("");
        setVideoS3Key("");
        setVideoFilename(null);
        setVideoContentType(null);
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

    if (sourceType === "url") {
      if (!videoUrl.trim()) {
        newErrors.videoUrl = "Video URL is required";
      } else if (!isValidUrl(videoUrl)) {
        newErrors.videoUrl = "Please enter a valid URL";
      }
    } else {
      if (!videoS3Key.trim()) {
        newErrors.videoUpload = "Please upload a video file";
      }
    }

    const orderNum = parseInt(orderIndex);
    if (isNaN(orderNum) || orderNum < 1) {
      newErrors.orderIndex = "Order must be a positive number";
    } else {
      const currentVideoId = isEditMode && video ? video.id : undefined;
      const videos = course.videos ?? [];
      const existingVideo = videos.find(
        (v) =>
          v.order_index === orderNum && v.id !== currentVideoId
      );
      if (existingVideo) {
        newErrors.orderIndex = "This order position is already taken";
      }
    }

    const weekStr = String(weekNumber ?? "").trim();
    if (weekStr && weekStr !== "0") {
      const weekNum = parseInt(weekStr, 10);
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

  const handleUploadVideo = async () => {
    if (!course?.id) return;
    setUploadingVideo(true);
    try {
      const pickResult = await DocumentPicker.getDocumentAsync({
        type: ["video/mp4", "video/quicktime"],
        copyToCacheDirectory: true,
      });
      if (pickResult.canceled) {
        setUploadingVideo(false);
        return;
      }
      const file = pickResult.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });
      const size = (fileInfo as { size?: number }).size;
      if (typeof size === "number" && size > MAX_VIDEO_SIZE_BYTES) {
        Alert.alert(
          "File too large",
          `Video must be under ${formatBytes(MAX_VIDEO_SIZE_BYTES)}. This file is ${formatBytes(size)}.`
        );
        setUploadingVideo(false);
        return;
      }
      const mimeType = file.mimeType || "video/mp4";
      const urlRes = await materialService.requestUploadUrl({
        course_id: course.id,
        material_type: "video",
        filename: file.name,
        content_type: mimeType,
      });
      if (!urlRes.success || !urlRes.data) {
        Alert.alert("Error", urlRes.error || "Failed to get upload URL");
        setUploadingVideo(false);
        return;
      }
      const uploadRes = await materialService.uploadFileToPresignedUrl(
        urlRes.data.upload_url,
        file.uri,
        mimeType
      );
      if (!uploadRes.success) {
        Alert.alert("Upload failed", uploadRes.error || "Please try again.");
        setUploadingVideo(false);
        return;
      }
      setVideoS3Key(urlRes.data.s3_key);
      setVideoFilename(file.name);
      setVideoContentType(mimeType);
      setVideoUrl("");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Upload failed. Please try again.");
    } finally {
      setUploadingVideo(false);
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
      const order = parseInt(orderIndex);
      const week = weekNumber ? parseInt(weekNumber) : undefined;
      if (sourceType === "url") {
        const payload = {
          title: title.trim(),
          description: description.trim() || undefined,
          video_url: videoUrl.trim(),
          order_index: order,
          week_number: week,
        };
        if (isEditMode && onUpdateVideo) {
          await onUpdateVideo({
            ...payload,
            video_s3_key: null,
            video_filename: null,
            video_content_type: null,
          });
        } else if (!isEditMode && onCreateVideo) {
          await onCreateVideo({ ...payload } as VideoCreateRequest);
        }
      } else {
        const payload = {
          title: title.trim(),
          description: description.trim() || undefined,
          video_s3_key: videoS3Key.trim(),
          video_filename: videoFilename || undefined,
          video_content_type: videoContentType || undefined,
          order_index: order,
          week_number: week,
        };
        if (isEditMode && onUpdateVideo) {
          await onUpdateVideo({
            ...payload,
            video_url: undefined,
          });
        } else if (!isEditMode && onCreateVideo) {
          await onCreateVideo({
            ...payload,
            video_url: undefined,
          } as VideoCreateRequest);
        }
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
              <Text style={styles.modalLabel}>Video source</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.searchInput,
                    { flex: 1, paddingVertical: 12, alignItems: "center" },
                    sourceType === "url" && { borderColor: themes.vegasGold },
                  ]}
                  onPress={() => setSourceType("url")}
                >
                  <Text style={styles.buttonText}>External URL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.searchInput,
                    { flex: 1, paddingVertical: 12, alignItems: "center" },
                    sourceType === "upload" && { borderColor: themes.vegasGold },
                  ]}
                  onPress={() => setSourceType("upload")}
                >
                  <Text style={styles.buttonText}>Upload file</Text>
                </TouchableOpacity>
              </View>
              {sourceType === "url" ? (
                <>
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
                </>
              ) : (
                <>
                  {videoS3Key ? (
                    <Text style={styles.inputDescription}>
                      Uploaded: {videoFilename || "video file"}
                    </Text>
                  ) : null}
                  {errors.videoUpload && (
                    <Text style={styles.warningText}>{errors.videoUpload}</Text>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      style={[styles.confirmButton, { flex: 1 }]}
                      onPress={handleUploadVideo}
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? (
                        <ActivityIndicator size="small" color={themes.white} />
                      ) : (
                        <Text style={styles.buttonText}>
                          {videoS3Key ? "Replace video" : "Upload video (mp4, mov)"}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {videoS3Key && (
                      <TouchableOpacity
                        style={[styles.cancelButton, { flex: 1 }]}
                        onPress={() => {
                          setVideoS3Key("");
                          setVideoFilename(null);
                          setVideoContentType(null);
                        }}
                        disabled={uploadingVideo}
                      >
                        <Text style={styles.buttonText}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.inputDescription}>
                    Or switch to External URL above
                  </Text>
                </>
              )}
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
                  onValueChange={(itemValue) => {
                    if (itemValue == null || itemValue === "" || itemValue === 0 || String(itemValue) === "0") {
                      setWeekNumber("");
                    } else {
                      setWeekNumber(String(itemValue));
                    }
                  }}
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
