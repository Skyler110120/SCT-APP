import { themes } from "@/src/context/themes";
import { courseFormStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/courseFormStyles";
import {
  CourseAdminView,
  CourseCreateRequest,
  CourseDifficulty,
  CourseUpdateRequest,
  GunType,
} from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { materialService } from "@/src/services/materialService";
import * as FileSystem from "expo-file-system";
import {
  MAX_PDF_SCRIPT_SIZE_BYTES,
  formatBytes,
} from "@/src/constants/uploadLimits";

interface CourseFormProps {
  visible: boolean;
  course?: CourseAdminView | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateCourse?: (data: CourseCreateRequest) => Promise<void>;
  onUpdateCourse?: (data: CourseUpdateRequest) => Promise<void>;
  /** When creating, default display order is existingCourseCount + 1 (append at end). */
  existingCourseCount?: number;
  /** In edit mode, called when user taps "Add video" so parent can open VideoForm for this course. */
  onOpenAddVideo?: (course: CourseAdminView) => void;
}

export default function CourseForm({
  visible,
  course,
  isSubmitting,
  onClose,
  onCreateCourse,
  onUpdateCourse,
  existingCourseCount = 0,
  onOpenAddVideo,
}: CourseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredGunType, setRequiredGunType] = useState(GunType.HANDGUN);
  const [difficultyLevel, setDifficultyLevel] = useState(
    CourseDifficulty.BEGINNER
  );
  const [orderIndex, setOrderIndex] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [pdfS3Key, setPdfS3Key] = useState("");
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [instructorScriptS3Key, setInstructorScriptS3Key] = useState("");
  const [instructorScriptFilename, setInstructorScriptFilename] = useState<string | null>(null);
  const [pdfIsPublic, setPdfIsPublic] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingScript, setUploadingScript] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = course !== null && course !== undefined;

  useEffect(() => {
    if (visible) {
      if (isEditMode && course) {
        setTitle(course.title);
        setDescription(course.description || "");
        setRequiredGunType(course.required_gun_type as GunType);
        setDifficultyLevel(course.difficulty_level as CourseDifficulty);
        setOrderIndex(course.order_index.toString());
        setIsActive(course.is_active);
        setPdfS3Key(course.pdf_s3_key || "");
        setPdfFilename(course.pdf_filename || null);
        setPdfIsPublic(course.pdf_is_public ?? false);
        setInstructorScriptS3Key(course.instructor_script_s3_key || "");
        setInstructorScriptFilename(course.instructor_script_filename || null);
      } else {
        setTitle("");
        setDescription("");
        setRequiredGunType(GunType.HANDGUN);
        setDifficultyLevel(CourseDifficulty.BEGINNER);
        setOrderIndex(String((existingCourseCount ?? 0) + 1));
        setIsActive(true);
        setPdfS3Key("");
        setPdfFilename(null);
        setPdfIsPublic(false);
        setInstructorScriptS3Key("");
        setInstructorScriptFilename(null);
      }
      setErrors({});
    }
  }, [visible, isEditMode, course, existingCourseCount]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Course title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Course title must be at least 3 characters";
    }

    const orderNum = parseInt(orderIndex);
    if (isNaN(orderNum) || orderNum < 1) {
      newErrors.orderIndex = "Order must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadPdf = async () => {
    if (!course?.id) return;
    setUploadingPdf(true);
    try {
      const pickResult = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (pickResult.canceled) {
        setUploadingPdf(false);
        return;
      }
      const file = pickResult.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });
      const size = (fileInfo as { size?: number }).size;
      if (typeof size === "number" && size > MAX_PDF_SCRIPT_SIZE_BYTES) {
        Alert.alert(
          "File too large",
          `PDF must be under ${formatBytes(MAX_PDF_SCRIPT_SIZE_BYTES)}. This file is ${formatBytes(size)}.`
        );
        setUploadingPdf(false);
        return;
      }
      const urlRes = await materialService.requestUploadUrl({
        course_id: course.id,
        material_type: "course_pdf",
        filename: file.name,
        content_type: "application/pdf",
      });
      if (!urlRes.success || !urlRes.data) {
        Alert.alert("Error", urlRes.error || "Failed to get upload URL");
        setUploadingPdf(false);
        return;
      }
      const uploadRes = await materialService.uploadFileToPresignedUrl(
        urlRes.data.upload_url,
        file.uri,
        "application/pdf"
      );
      if (!uploadRes.success) {
        Alert.alert("Upload failed", uploadRes.error || "Please try again.");
        setUploadingPdf(false);
        return;
      }
      setPdfS3Key(urlRes.data.s3_key);
      setPdfFilename(file.name);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Upload failed. Please try again.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleUploadScript = async () => {
    if (!course?.id) return;
    setUploadingScript(true);
    try {
      const pickResult = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (pickResult.canceled) {
        setUploadingScript(false);
        return;
      }
      const file = pickResult.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });
      const size = (fileInfo as { size?: number }).size;
      if (typeof size === "number" && size > MAX_PDF_SCRIPT_SIZE_BYTES) {
        Alert.alert(
          "File too large",
          `Script must be under ${formatBytes(MAX_PDF_SCRIPT_SIZE_BYTES)}. This file is ${formatBytes(size)}.`
        );
        setUploadingScript(false);
        return;
      }
      const urlRes = await materialService.requestUploadUrl({
        course_id: course.id,
        material_type: "instructor_script",
        filename: file.name,
        content_type: "application/pdf",
      });
      if (!urlRes.success || !urlRes.data) {
        Alert.alert("Error", urlRes.error || "Failed to get upload URL");
        setUploadingScript(false);
        return;
      }
      const uploadRes = await materialService.uploadFileToPresignedUrl(
        urlRes.data.upload_url,
        file.uri,
        "application/pdf"
      );
      if (!uploadRes.success) {
        Alert.alert("Upload failed", uploadRes.error || "Please try again.");
        setUploadingScript(false);
        return;
      }
      setInstructorScriptS3Key(urlRes.data.s3_key);
      setInstructorScriptFilename(file.name);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Upload failed. Please try again.");
    } finally {
      setUploadingScript(false);
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
      if (isEditMode && onUpdateCourse) {
        const updateData: CourseUpdateRequest = {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          required_gun_type: requiredGunType || undefined,
          difficulty_level: difficultyLevel || undefined,
          order_index: parseInt(orderIndex) || undefined,
          is_active: isActive,
          pdf_s3_key: pdfS3Key.trim() || undefined,
          instructor_script_s3_key: instructorScriptS3Key.trim() || undefined,
          pdf_filename: pdfFilename || undefined,
          instructor_script_filename: instructorScriptFilename || undefined,
          pdf_content_type: pdfS3Key ? "application/pdf" : undefined,
          instructor_script_content_type: instructorScriptS3Key ? "application/pdf" : undefined,
          pdf_is_public: pdfIsPublic,
        };

        console.log("📚 Updating course:", updateData);
        await onUpdateCourse(updateData);
      } else if (!isEditMode && onCreateCourse) {
        const createData: CourseCreateRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          required_gun_type: requiredGunType,
          difficulty_level: difficultyLevel,
          order_index: parseInt(orderIndex),
          pdf_s3_key: pdfS3Key.trim() || undefined,
          instructor_script_s3_key: instructorScriptS3Key.trim() || undefined,
          pdf_filename: pdfFilename || undefined,
          instructor_script_filename: instructorScriptFilename || undefined,
          pdf_is_public: pdfIsPublic,
        };
        console.log("📚 Creating course:", createData);
        await onCreateCourse(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const getMaterialStatus = () => {
    if (!isEditMode || !course) return null;

    const hasPdf = Boolean(course.pdf_s3_key?.trim());
    const hasScript = Boolean(course.instructor_script_s3_key?.trim());

    return { hasPdf, hasScript };
  };

  const materialStatus = getMaterialStatus();

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditMode ? "Edit Course" : "Create New Course"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Course Title</Text>
                <TextInput
                  style={[
                    styles.searchInput,
                    errors.title && { borderColor: "#FF4444" },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter course title..."
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
                  placeholder="Enter course description..."
                  placeholderTextColor={themes.white}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Required Gun Type *</Text>
                <View style={styles.modalPickerContainer}>
                  <Picker
                    selectedValue={requiredGunType}
                    onValueChange={(itemValue) => setRequiredGunType(itemValue)}
                    style={styles.modalPicker}
                    dropdownIconColor={themes.vegasGold}
                  >
                    {Object.values(GunType).map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Difficulty Level</Text>
                <View style={styles.modalPickerContainer}>
                  <Picker
                    selectedValue={difficultyLevel}
                    onValueChange={(itemValue) => setDifficultyLevel(itemValue)}
                    style={styles.modalPicker}
                    dropdownIconColor={themes.vegasGold}
                  >
                    {Object.values(CourseDifficulty).map((level) => (
                      <Picker.Item key={level} label={level} value={level} />
                    ))}
                  </Picker>
                </View>
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
                  maxLength={2}
                />
                {errors.orderIndex && (
                  <Text style={styles.warningText}>{errors.orderIndex}</Text>
                )}
                <Text style={styles.inputDescription}>
                  Display position (1 = first). Courses at this position and below will shift down.
                </Text>
              </View>

              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Course PDF</Text>
                {isEditMode && course ? (
                  <>
                    <Text style={styles.inputDescription}>
                      {pdfS3Key
                        ? `Current file: ${pdfFilename || "Course PDF"}`
                        : "No PDF uploaded."}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        style={[styles.confirmButton, { flex: 1 }]}
                        onPress={handleUploadPdf}
                        disabled={uploadingPdf}
                      >
                        {uploadingPdf ? (
                          <ActivityIndicator size="small" color={themes.white} />
                        ) : (
                          <Text style={styles.buttonText}>
                            {pdfS3Key ? "Replace PDF" : "Upload course PDF"}
                          </Text>
                        )}
                      </TouchableOpacity>
                      {pdfS3Key && (
                        <TouchableOpacity
                          style={[styles.cancelButton, { flex: 1 }]}
                          onPress={() => {
                            setPdfS3Key("");
                            setPdfFilename(null);
                          }}
                          disabled={uploadingPdf}
                        >
                          <Text style={styles.buttonText}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                      <Text style={[styles.inputDescription, { marginBottom: 0 }]}>
                        Visible to students (public)
                      </Text>
                      <Switch
                        value={pdfIsPublic}
                        onValueChange={setPdfIsPublic}
                        trackColor={{ false: "#555", true: themes.vegasGold }}
                        thumbColor={themes.white}
                      />
                    </View>
                    <Text style={[styles.inputDescription, { marginTop: 4 }]}>
                      When on, enrolled students can view this PDF. When off, only instructors and admins can see it.
                    </Text>
                  </>
                ) : (
                  <Text style={styles.inputDescription}>
                    Save the course first, then add a PDF from the edit screen.
                  </Text>
                )}
              </View>

              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Instructor Script</Text>
                {isEditMode && course ? (
                  <>
                    <Text style={styles.inputDescription}>
                      {instructorScriptS3Key
                        ? `Current file: ${instructorScriptFilename || "Instructor Script"}`
                        : "No script uploaded."}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        style={[styles.confirmButton, { flex: 1 }]}
                        onPress={handleUploadScript}
                        disabled={uploadingScript}
                      >
                        {uploadingScript ? (
                          <ActivityIndicator size="small" color={themes.white} />
                        ) : (
                          <Text style={styles.buttonText}>
                            {instructorScriptS3Key ? "Replace script" : "Upload instructor script"}
                          </Text>
                        )}
                      </TouchableOpacity>
                      {instructorScriptS3Key && (
                        <TouchableOpacity
                          style={[styles.cancelButton, { flex: 1 }]}
                          onPress={() => {
                            setInstructorScriptS3Key("");
                            setInstructorScriptFilename(null);
                          }}
                          disabled={uploadingScript}
                        >
                          <Text style={styles.buttonText}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <Text style={styles.inputDescription}>
                    Save the course first, then add the script from the edit screen.
                  </Text>
                )}
              </View>

              {isEditMode && course && (
                <View style={styles.createSection}>
                  <Text style={styles.modalLabel}>Videos</Text>
                  <Text style={styles.inputDescription}>
                    {course.videos?.length
                      ? `${course.videos.length} video${course.videos.length === 1 ? "" : "s"} in this course.`
                      : "No videos yet."}
                    {" "}Add a video here or use the Manage Videos screen to edit later.
                  </Text>
                  <TouchableOpacity
                    style={[styles.confirmButton, { marginTop: 8 }]}
                    onPress={() => onOpenAddVideo?.(course)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.buttonText}>Add video</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isEditMode && materialStatus && (
                <View style={styles.createSection}>
                  <Text style={styles.modalLabel}>Current Material Status</Text>
                  <View style={styles.materialStatusContainer}>
                    <View style={styles.materialStatusRow}>
                      <FontAwesome
                        name={materialStatus.hasPdf ? "file-pdf-o" : "file-o"}
                        size={24}
                        color={
                          materialStatus.hasPdf ? themes.vegasGold : "#888"
                        }
                      />
                      <Text
                        style={[
                          styles.materialStatusText,
                          {
                            color: materialStatus.hasPdf
                              ? themes.vegasGold
                              : "#888",
                          },
                        ]}
                      >
                        {materialStatus.hasPdf
                          ? "PDF Available"
                          : "No PDF Available"}
                      </Text>
                    </View>
                    <View style={styles.materialStatusRow}>
                      <FontAwesome
                        name={
                          materialStatus.hasScript ? "file-text-o" : "file-o"
                        }
                        size={24}
                        color={
                          materialStatus.hasScript ? themes.vegasGold : "#888"
                        }
                      />
                      <Text
                        style={[
                          styles.materialStatusText,
                          {
                            color: materialStatus.hasScript
                              ? themes.vegasGold
                              : "#888",
                          },
                        ]}
                      >
                        {materialStatus.hasScript
                          ? "Script Available"
                          : "No Script Available"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.inputDescription}>
                    Students and instructors will be able to access these
                    materials securely.
                  </Text>
                </View>
              )}
              {isEditMode && (
                <View style={styles.createSection}>
                  <Text style={styles.modalLabel}>Course Status</Text>
                  <View style={styles.modalPickerContainer}>
                    <Picker
                      selectedValue={isActive}
                      onValueChange={(itemValue) => setIsActive(itemValue)}
                      style={styles.modalPicker}
                      dropdownIconColor={themes.vegasGold}
                    >
                      <Picker.Item label="Active" value={true} />
                      <Picker.Item label="Inactive" value={false} />
                    </Picker>
                  </View>
                  <Text style={styles.inputDescription}>
                    Inactive courses are hidden from students
                  </Text>
                </View>
              )}
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
                      {isEditMode ? "Updating..." : "Creating..."}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    {isEditMode ? "Update Course" : "Create Course"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
