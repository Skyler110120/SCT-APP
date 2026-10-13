import { themes } from "@/src/context/themes";
import { courseOverviewCardStyles as styles } from "@/src/styles/CoursePageStyles/courseOverviewCardStyles";
import { CourseView } from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CourseOverviewCardProps {
  course: CourseView;
  studentCount: number;
  isSelected: boolean;
  onSelect: () => void;
  showStudentCount: boolean;
  showMaterialAccess?: boolean;
}

const CourseOverviewCard: React.FC<CourseOverviewCardProps> = ({
  course,
  studentCount,
  isSelected,
  onSelect,
  showStudentCount,
  showMaterialAccess = false,
}) => {
  const videoCount = course?.videos?.length || 0;
  const hasPdf = Boolean(course?.pdf_s3_key?.trim());
  const hasScript = Boolean(course?.instructor_script_s3_key?.trim())
  const canAccessScript = course.viewType === 'instructor' || course.viewType === 'admin';



  return (
    <TouchableOpacity
      style={[
        styles.courseCard,
        isSelected && styles.selectedCourseCard, 
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.courseCardContent}>
        <View style={styles.courseHeader}>
          <View style={styles.courseTitleSection}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {course.title}
            </Text>
          </View>
        </View>
        <Text style={styles.courseDescription} numberOfLines={3}>
          {course.description || "No description available"}
        </Text>
        <View style={styles.courseInfo}>
          <View style={styles.courseBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.required_gun_type}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.difficulty_level}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{videoCount} videos</Text>
            </View>
            {hasPdf && (
              <View style={styles.badge}>
                <FontAwesome name="file-pdf-o" size={12} color={themes.vegasGold} />
                <Text style={styles.badgeText}> PDF</Text>
              </View>
            )}
            {hasScript && canAccessScript && (
              <View style={styles.badge}>
                <FontAwesome name="file-text-o" size={12} color={themes.vegasGold} />
                <Text style={styles.badgeText}> Script</Text>
              </View>
            )}
            {showStudentCount && (
              <View style={styles.badge}>
                <FontAwesome name="users" size={12} color={themes.vegasGold} />
                <Text style={styles.badgeText}> {studentCount}</Text>
              </View>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <FontAwesome
              name="check-circle"
              size={16}
              color={themes.vegasGold}
            />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CourseOverviewCard;
