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
import { FontAwesome } from "@expo/vector-icons";
import { masterAdminManageCourses as styles } from "@/src/styles/masterAdminManageCourses";
import {
  CourseAdminView,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseDifficulty,
  GunType,
} from "@/src/types/course.types";
import { themes } from "@/src/context/themes";

interface CourseFormProps {
  visible: boolean;
  course?: CourseAdminView | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateCourse?: (data: CourseCreateRequest) => Promise<void>;
  onUpdateCourse?: (data: CourseUpdateRequest) => Promise<void>;
}

export default function CourseForm({
  visible,
  course,
  isSubmitting,
  onClose,
  onCreateCourse,
  onUpdateCourse,
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
  const [instructorScriptS3Key, setInstructorScriptS3Key] = useState("");
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
        setInstructorScriptS3Key(course.instructor_script_s3_key || "");
      } else {
        setTitle("");
        setDescription("");
        setRequiredGunType(GunType.HANDGUN);
        setDifficultyLevel(CourseDifficulty.BEGINNER);
        setOrderIndex("1");
        setIsActive(true);
        setPdfS3Key("");
        setInstructorScriptS3Key("");
      }
      setErrors({});
    }
  }, [visible, isEditMode, course]);

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

    if (pdfS3Key && !isValidS3Key(pdfS3Key.trim())) {
      newErrors.pdfS3Key = "Invalid S3 key format";
    }

    if (instructorScriptS3Key && !isValidS3Key(instructorScriptS3Key.trim())) {
      newErrors.instructorScriptS3Key = "Invalid S3 key format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidS3Key = (key: string) => {
    if (!key.trim()) return true;

    if (key.startsWith("/")) return false; // No leading slash
    if (key.endsWith("/")) return false; // No trailing slash
    if (key.includes(".")) return false; // Should have file extension
    if (key.includes("//")) return false; // No double slashes
    if (key.includes(" ")) return false; // No spaces
    if (key.length > 500) return false; // length limit

    return true;
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
                Order in which the videos appear (1-99)
              </Text>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Course PDF S3 Key</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.pdfS3Key && { borderColor: "#FF4444" },
                ]}
                value={pdfS3Key}
                onChangeText={setPdfS3Key}
                placeholder="coursematerials/pdfs/basic-pistol-training.pdf"
                placeholderTextColor={themes.white}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.pdfS3Key && (
                <Text style={styles.warningText}>{errors.pdfS3Key}</Text>
              )}
              <Text style={styles.inputDescription}>
                Enter the S3 Course Pdf key here
              </Text>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Instructor Script S3 Key</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.instructorScriptS3Key && { borderColor: "#FF4444" },
                ]}
                value={instructorScriptS3Key}
                onChangeText={setInstructorScriptS3Key}
                placeholder="coursematerials/scripts/script.pdf"
                placeholderTextColor={themes.white}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.instructorScriptS3Key && (
                <Text style={styles.warningText}>
                  {errors.instructorScriptS3Key}
                </Text>
              )}
              <Text style={styles.inputDescription}>
                Enter the S3 Instructor Script key here
              </Text>
            </View>

            {isEditMode && materialStatus && (
              <View style={styles.createSection}>
                <Text style={styles.modalLabel}>Current Material Status</Text>
                <View style={styles.materialStatusContainer}>
                  <View style={styles.materialStatusRow}>
                    <FontAwesome
                      name={materialStatus.hasPdf ? "file-pdf-o" : "file-o"}
                      size={24}
                      color={materialStatus.hasPdf ? themes.vegasGold : "#888"}
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
                      name={materialStatus.hasScript ? "file-text-o" : "file-o"}
                      size={24}
                      color={
                        materialStatus.hasScript ? themes.vegasGold : "#888"
                      }
                    />
                    <Text style={[
                      styles.materialStatusText,
                      { color: materialStatus.hasScript ? themes.vegasGold : "#888"}
                    ]}>
                      {materialStatus.hasScript ? "Script Available" : "No Script Available"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.inputDescription}>
                  Students and instructors will be able to access these materials securely.
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
    </Modal>
  );
}
