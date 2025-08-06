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
  const [title, setTitle] = useState("") || undefined;
  const [description, setDescription] = useState("");
  const [requiredGunType, setRequiredGunType] = useState(GunType.HANDGUN);
  const [difficultyLevel, setDifficultyLevel] = useState(
    CourseDifficulty.BEGINNER
  );
  const [pdfUrl, setPdfUrl] = useState("");
  const [instructorScriptUrl, setInstructorScriptUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = course !== null && course !== undefined;

  useEffect(() => {
    if (visible) {
      if (isEditMode && course) {
        setTitle(course.title);
        setDescription(course.description || "");
        setRequiredGunType(course.required_gun_type as GunType);
        setDifficultyLevel(course.difficulty_level as CourseDifficulty);
        setPdfUrl(course.pdf_url || "");
        setInstructorScriptUrl(course.instructor_script_url || "");
        setOrderIndex(course.order_index.toString());
        setIsActive(course.is_active);
      } else {
        setTitle("");
        setDescription("");
        setRequiredGunType(GunType.HANDGUN);
        setDifficultyLevel(CourseDifficulty.BEGINNER);
        setPdfUrl("");
        setInstructorScriptUrl("");
        setOrderIndex("1");
        setIsActive(true);
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

    if (pdfUrl && !isValidUrl(pdfUrl)) {
      newErrors.pdfUrl = "Please enter a valid URL";
    }
    if (instructorScriptUrl && !isValidUrl(instructorScriptUrl)) {
      newErrors.instructorScriptUrl = "Please enter a valid URL";
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
      if (isEditMode && onUpdateCourse) {
        const updateData: CourseUpdateRequest = {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          required_gun_type: requiredGunType || undefined,
          difficulty_level: difficultyLevel || undefined,
          pdf_url: pdfUrl.trim() || undefined,
          instructor_script_url: instructorScriptUrl.trim() || undefined,
          order_index: parseInt(orderIndex) || undefined,
          is_active: isActive,
        };

        console.log("📚 Updating course:", updateData);
        await onUpdateCourse(updateData);
      } else if (!isEditMode && onCreateCourse) {
        const createData: CourseCreateRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          required_gun_type: requiredGunType,
          difficulty_level: difficultyLevel,
          pdf_url: pdfUrl.trim() || undefined,
          instructor_script_url: instructorScriptUrl.trim() || undefined,
          order_index: parseInt(orderIndex),
        };

        console.log("📚 Creating course:", createData);
        await onCreateCourse(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

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
                Order in which the videos appear (1-***)
              </Text>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Course PDF URL</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.pdfUrl && { borderColor: "#FF4444" },
                ]}
                value={pdfUrl}
                onChangeText={setPdfUrl}
                placeholder="https://example.com/course.pdf"
                placeholderTextColor={themes.white}
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.pdfUrl && (
                <Text style={styles.warningText}>{errors.pdfUrl}</Text>
              )}
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Instructor Script URL</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  errors.instructorScriptUrl && { borderColor: "#FF4444" },
                ]}
                value={instructorScriptUrl}
                onChangeText={setInstructorScriptUrl}
                placeholder="https://example.com/instructor-script.pdf"
                placeholderTextColor={themes.white}
                keyboardType="url"
                autoCapitalize="none"
              />
              {errors.instructorScriptUrl && (
                <Text style={styles.warningText}>
                  {errors.instructorScriptUrl}
                </Text>
              )}
              <Text style={styles.inputDescription}>
                Instructor-only teaching materials
              </Text>
            </View>

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
