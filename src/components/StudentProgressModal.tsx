import { themes } from "@/src/context/themes";
import { coursesStyles as styles } from "@/src/styles/CoursePageStyles/courseScreenStyles";
import { UserRole } from "@/src/types/auth.types";
import { StudentWeeklyProgress } from "@/src/types/enrollment.types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type ValidIconName = "check-circle" | "clock-o" | "circle-o";

interface ProgressStatus {
  status: "completed" | "in-progress" | "not-started";
  color: string;
  icon: ValidIconName;
}

interface StudentProgressModalProps {
  visible: boolean;
  students: StudentWeeklyProgress[];
  isLoading: boolean;
  canUpdate: boolean;
  userRole?: UserRole;
  onClose: () => void;
  onUpdateProgress: (data: any) => Promise<void>;
}

const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  visible,
  students,
  isLoading,
  canUpdate,
  userRole,
  onClose,
  onUpdateProgress,
}) => {
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">(
    "all"
  );
  const [updating, setUpdating] = useState<number | null>(null);

  const isAdmin = userRole === UserRole.ADMIN;
  const isInstructor = userRole === UserRole.INSTRUCTOR;

  const getFilteredStudents = () => {
    let filtered = [...students];

    if (filter === "in-progress") {
      filtered = filtered.filter(
        (student) => student.current_week < 24 && student.current_week > 0
      );
    } else if (filter === "completed") {
      filtered = filtered.filter((student) => student.current_week >= 24);
    }

    return filtered.sort((a, b) => {
      if (a.current_week >= 24 && b.current_week < 24) return 1;
      if (a.current_week < 24 && b.current_week >= 24) return -1;
      if (a.current_week !== b.current_week) {
        return b.current_week - a.current_week;
      }
      return a.student_name.localeCompare(b.student_name);
    });
  };

  const handleUpdateProgress = async (student: StudentWeeklyProgress) => {
    if (!canUpdate || updating !== null) {
      Alert.alert(
        "Please wait",
        updating !== null ? "Another update is in progress" : "Please wait"
      );
      return;
    }

    Alert.alert(
      "Update Progress",
      `Advance ${student.student_name} to week ${student.current_week + 1}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Advance",
          style: "default",
          onPress: async () => {
            setUpdating(student.enrollment_id);

            try {
              await onUpdateProgress({
                enrollment_id: student.enrollment_id,
                new_week: student.current_week + 1,
                notes: `Advanced by $${userRole} on ${new Date().toLocaleDateString()}`,
              });
            } catch (error) {
              console.error("Error updating progress:", error);
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const getProgressStatus = (
    student: StudentWeeklyProgress
  ): ProgressStatus => {
    if (student.current_week >= 24) {
      return { status: "completed", color: "#4CAF50", icon: "check-circle" };
    } else if (student.current_week > 0) {
      return {
        status: "in-progress",
        color: themes.vegasGold,
        icon: "clock-o",
      };
    } else {
      return { status: "not-started", color: "#9E9E9E9", icon: "circle-o" };
    }
  };

  const filteredStudents = getFilteredStudents();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color={themes.white} />
          </TouchableOpacity>

          <View style={styles.modalTitleSection}>
            <Text style={styles.modalTitle}>
              {isAdmin ? "All Students" : "My Students"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {students.length} Student{students.length !== 1 ? "s" : ""}{" "}
              Tracked
            </Text>
          </View>

          <View style={styles.closeButtonPlaceholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themes.vegasGold} />
            <Text style={styles.loadingText}>Loading student progress...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyStateModal}>
            <FontAwesome name="users" size={48} color={themes.vegasGold} />
            <Text style={styles.emptyStateText}>No students</Text>
            <Text style={styles.emptyStateText}>
              No students are currently enrolled in active courses.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Filter Students</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "all" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter("all")}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === "all" && styles.filterButtonTextActive,
                    ]}
                  >
                    All ({students.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "in-progress" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter("in-progress")}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === "in-progress" && styles.filterButtonTextActive,
                    ]}
                  >
                    In Progress (
                    {
                      students.filter(
                        (student) =>
                          student.current_week > 0 && student.current_week < 24
                      ).length
                    }
                    )
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "completed" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter("completed")}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === "completed" && styles.filterButtonTextActive,
                    ]}
                  >
                    Completed (
                    {
                      students.filter((student) => student.current_week >= 24)
                        .length
                    }
                    )
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredStudents.map((student, index) => {
                const progressStatus = getProgressStatus(student);
                const isUpdatingThis = updating === student.enrollment_id;

                return (
                  <View
                    key={`${student.enrollment_id}-${index}`}
                    style={styles.studentItem}
                  >
                    <View style={styles.studentInfo}>
                      <View style={styles.studentHeaderRow}>
                        <FontAwesome
                          name={progressStatus.icon}
                          size={24}
                          color={progressStatus.color}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.studentName}>
                          {student.student_name}
                        </Text>
                      </View>
                      <Text style={styles.studentCourse}>
                        {student.course_title}
                      </Text>

                      <View style={styles.progressInfo}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(
                                  student.progress_percentage,
                                  100
                                )}%`,
                                backgroundColor: progressStatus.color,
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.progressStatusRow}>
                          <Text style={styles.progressText}>
                            Week {student.current_week} of 24 -{" "}
                            {student.progress_percentage.toFixed(0)}%
                          </Text>
                          <Text
                            style={[
                              styles.progressText,
                              { color: progressStatus.color },
                            ]}
                          >
                            {progressStatus.status === "completed"
                              ? "Completed"
                              : progressStatus.status === "in-progress"
                              ? "Active"
                              : "Not Started"}
                          </Text>
                        </View>
                      </View>
                      {student.instructor_notes && (
                        <Text style={styles.studentNotes}>
                          Notes: {student.instructor_notes}
                        </Text>
                      )}
                    </View>

                    {canUpdate && student.current_week < 24 && (
                      <TouchableOpacity
                        style={[
                          styles.updateButton,
                          isUpdatingThis && styles.updateButtonDisabled,
                        ]}
                        onPress={() => handleUpdateProgress(student)}
                        disabled={isUpdatingThis}
                      >
                        {isUpdatingThis ? (
                          <ActivityIndicator
                            size="small"
                            color={themes.black}
                          />
                        ) : (
                          <FontAwesome
                            name="arrow-up"
                            size={16}
                            color={themes.black}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {filteredStudents.length === 0 && (
                <View style={styles.emptyStateModal}>
                  <FontAwesome
                    name="filter"
                    size={48}
                    color={themes.vegasGold}
                  />
                  <Text style={styles.emptyStateTitle}>No Students Found</Text>
                  <Text style={styles.emptyStateText}>
                    No students match the current filter criteria.
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default StudentProgressModal;
