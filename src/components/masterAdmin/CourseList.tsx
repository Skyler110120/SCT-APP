import { themes } from "@/src/context/themes";
import { courseListStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/courseListStyles";
import { CourseAdminView } from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CourseListProps {
  courses: CourseAdminView[];
  selectedCourse: CourseAdminView | null;
  onSelectCourse: (course: CourseAdminView) => void;
  onEditCourse: (course: CourseAdminView) => void;
  onDeleteCourse: (course: CourseAdminView) => void;
  isLoading: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  selectedCourse,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
  isLoading,
}) => {
  const formatCourseInfo = (course: CourseAdminView) => {
    const videoCount = course.videos.length;
    const videoText = videoCount === 1 ? "video" : "videos";
    return `${videoCount} ${videoText} : Order ${course.order_index}`;
  };

  const formatStatus = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const renderItem = ({ item }: { item: CourseAdminView }) => {
    const isSelected = selectedCourse?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.row,
          isSelected && {
            backgroundColor: themes.black + "80",
            borderColor: themes.vegasGold,
            borderWidth: 2,
          },
        ]}
        onPress={() => onSelectCourse(item)}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.description}>
            {item.description || "No description provided"}
          </Text>

          <View style={styles.details}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.required_gun_type}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.difficulty_level}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatCourseInfo(item)}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  borderColor: item.is_active ? themes.vegasGold : "#FF4444",
                  backgroundColor: item.is_active
                    ? themes.black
                    : "rgba(255, 68 68, 0.1)",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.is_active ? themes.vegasGold : "#FF4444" },
                ]}
              >
                {formatStatus(item.is_active)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.courseButton}
            onPress={() => onEditCourse(item)}
            activeOpacity={0.7}
          >
            <FontAwesome name="edit" size={16} color={themes.vegasGold} />
            <Text style={styles.actionText}>Edit Course</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.courseButton}
            onPress={() => onDeleteCourse(item)}
            activeOpacity={0.7}
          >
            <FontAwesome name="trash" size={16} color="#FF4444" />
            <Text style={[styles.actionText, styles.removeText]}>
              Delete Course
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tableContainer}>
        <Text style={styles.tableSectionTitle}>
            Courses ({courses.length})
        </Text>

        {courses.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No courses found</Text>
            </View>
        ) : (
            <View style={styles.listContent}>
                {courses.map((item, index) => (
                    <React.Fragment key={item.id.toString()}>
                        {index > 0 && <View style={styles.separator} />}
                        {renderItem({ item })}
                    </React.Fragment>
                ))}
            </View>
        )}
    </View>
  )
};

export default CourseList;
