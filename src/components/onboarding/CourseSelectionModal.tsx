import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { CourseSummary } from "@/src/types/course.types";
import { CompanyInfo } from "@/src/types/onboarding.types";
import { Instructor } from "@/src/types/instructor.types";
import { onboardingService } from "@/src/services/onboardingService";
import { themes } from "@/src/context/themes";
import { registerScreenStyles as styles } from "@/src/styles/registerScreen";

type ValidIconName = "circle-o" | "dot-circle-o" | "bullseye";

interface CourseSelectionModalProps {
  isVisible: boolean;
  companyInfo: CompanyInfo;
  selectedInstructor: Instructor;
  courses: CourseSummary[];
  isLoading: boolean;
  onCourseSelected: (course: CourseSummary) => void;
  onError: (error: string) => void;
  onRetry: () => void;
  onBack: () => void;
}

export const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  isVisible,
  companyInfo,
  selectedInstructor,
  courses,
  isLoading: coursesLoading,
  onCourseSelected,
  onError,
  onRetry,
  onBack,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleCourseSelection = async (course: CourseSummary) => {
    console.log("User selected course:", course.title);

    setSelectedCourseId(course.id);
    setIsSaving(true);

    try {
      await onboardingService.saveSelectedCourse(course);
      onCourseSelected(course);
    } catch (error) {
      onError("Failed to save course selection. Please try again.");
      setSelectedCourseId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    if (level.toLowerCase() === "beginner") {
      return "#4CAF50";
    } else if (level.toLowerCase() === "intermediate") {
      return "#FF9800";
    } else if (level.toLowerCase() === "advanced") {
      return "#F44336";
    } else {
      return themes.vegasGold;
    }
  };

  const getDifficultyIcon = (level: string): ValidIconName => {
    if (level.toLowerCase() === "beginner") {
      return "circle-o";
    } else if (level.toLowerCase() === "intermediate") {
      return "dot-circle-o";
    } else if (level.toLowerCase() === "advanced") {
      return "bullseye";
    } else {
      return "circle-o";
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FontAwesome name="graduation-cap" size={48} color={themes.vegasGold} />
      <Text style={styles.emptyStateTitle}>No Course Available</Text>
      <Text style={styles.emptyStateDescription}>
        {companyInfo.company_name} doesn't have any active training courses yet.
        Contact your administrator to set up courses before continuing.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themes.vegasGold} />
      <Text style={styles.loadingText}>Loading available courses...</Text>
    </View>
  );

  const renderCourseCard = (course: CourseSummary) => {
    const isSelected = selectedCourseId === course.id;
    const difficultyColor = getDifficultyColor(course.difficulty_level);
    const difficultyIcon = getDifficultyIcon(course.difficulty_level);

    return (
      <TouchableOpacity
        key={course.id}
        style={[
          styles.courseCard,
          isSelected && styles.selectedCourseCard,
          isSaving && isSelected && styles.disabledButton,
        ]}
        onPress={() => handleCourseSelection(course)}
        disabled={isSaving}
      >
        <View style={styles.courseCardHeader}>
          <View style={styles.courseIconContainer}>
            <FontAwesome
              name="book"
              size={24}
              color={isSelected ? themes.black : themes.vegasGold}
            />
          </View>
          <View style={styles.courseTitleContainer}>
            <Text
              style={[
                styles.courseTitle,
                isSelected && styles.selectedCourseTitle,
              ]}
            >
              {course.title}
            </Text>
            <View style={styles.courseMetaContainer}>
              <View style={styles.difficultyBadge}>
                <FontAwesome
                  name={difficultyIcon}
                  size={16}
                  color={difficultyColor}
                />
                <Text
                  style={[styles.difficultyText, { color: difficultyColor }]}
                >
                  {course.difficulty_level}
                </Text>
              </View>
              <Text
                style={[
                  styles.gunTypeText,
                  isSelected && styles.selectedGunTypeText,
                ]}
              >
                {course.required_gun_type}
              </Text>
            </View>
          </View>
        </View>

        {course.description && (
          <Text
            style={[
              styles.courseDescription,
              isSelected && styles.selectedCourseDescription,
            ]}
          >
            {course.description}
          </Text>
        )}

        <View style={styles.courseFooter}>
          <Text
            style={[
              styles.courseOrder,
              isSelected && styles.selectedCourseOrder,
            ]}
          >
            Course {course.order_index} • 24 Weeks
          </Text>

          {isSelected && isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={themes.black} />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCourseList = () => (
    <View style={styles.courseListContainer}>
      <Text style={styles.courseListTitle}>Choose Your Training Course</Text>

      <Text style={styles.courseListDescription}>
        Select the course you signed up for Your Instructor{" "}
        {selectedInstructor.first_name} {selectedInstructor.last_name} will
        guide you
      </Text>

      <ScrollView
        style={styles.courseScrollView}
        showsVerticalScrollIndicator={false}
      >
        {courses.map(renderCourseCard)}
      </ScrollView>
    </View>
  );

  return (
    <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
    >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.courseSelectionModal]}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <FontAwesome name="arrow-left" size={20} color={themes.black} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Your Course</Text>
                    <View style={styles.backButton} />
                </View>

                <View style={styles.contentContainer}>
                    {coursesLoading ? (
                        renderLoadingState()
                    ) : courses.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        renderCourseList()
                    )}
                </View>
            </View>
        </View>
    </Modal>
  )
};
