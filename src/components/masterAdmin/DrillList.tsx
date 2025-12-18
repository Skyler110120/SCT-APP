import { themes } from "@/src/context/themes";
import { drillListStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/drillListStyles";
import { CourseDrill, DrillType } from "@/src/types/course.drills.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface DrillListProps {
  drills: CourseDrill[];
  selectedDrill: CourseDrill | null;
  onSelectDrill: (drill: CourseDrill) => void;
  onEditDrill: (drill: CourseDrill) => void;
  onDeleteDrill: (drill: CourseDrill) => void;
  isLoading: boolean;
}

const DrillList: React.FC<DrillListProps> = ({
  drills,
  selectedDrill,
  onSelectDrill,
  onEditDrill,
  onDeleteDrill,
  isLoading,
}) => {
  const formatDrillType = (type: DrillType) => {
    if (type === DrillType.TIME) return "Time-Based";
    if (type === DrillType.SCORE) return "Score-Based";
    if (type === DrillType.ACCURACY) return "Accuracy-Based";
    return type;
  };

  const formatStandard = (value: number, unit: string, type: DrillType) => {
    if (type === DrillType.TIME) {
      return `≤ ${value} ${unit}`;
    } else if (type === DrillType.SCORE || type === DrillType.ACCURACY) {
      return `≥ ${value} ${unit}`;
    } else {
      return `${value} ${unit}`;
    }
  };

  const formatStatus = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const renderItem = ({ item }: { item: CourseDrill }) => {
    const isSelected = selectedDrill?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.row,
          isSelected && {
            backgroundColor: themes.black,
            borderColor: themes.vegasGold,
            borderTopWidth: 1,
            borderBottomWidth: 1,
          },
        ]}
        onPress={() => onSelectDrill(item)}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={styles.name}>{item.drill_name}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          <View style={styles.details}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {formatDrillType(item.drill_type)}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Standard:{" "}
                {formatStandard(
                  item.standard_value,
                  item.standard_unit,
                  item.drill_type
                )}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Order: {item.display_order}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  borderColor: item.is_active ? themes.vegasGold : "#FF4444",
                  backgroundColor: item.is_active
                    ? themes.black
                    : "rgba(255, 68, 68, 0.1)",
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
            onPress={() => onEditDrill(item)}
            activeOpacity={0.7}
          >
            <FontAwesome name="edit" size={16} color={themes.vegasGold} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.courseButton}
            onPress={() => onDeleteDrill(item)}
            activeOpacity={0.7}
          >
            <FontAwesome name="trash" size={16} color="#FF4444" />
            <Text style={[styles.actionText, styles.removeText]}>
              Delete Drill
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tableContainer}>
        <Text style={styles.tableSectionTitle}>
            Course Drills ({drills.length})
        </Text>

        {drills.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                    No drills found for this course
                </Text>
                <Text style={[styles.emptyStateText, { marginTop: 8, opacity: 0.7 }]}>
                    Create your first drill to get started
                </Text>
            </View>
        ) : (
            <FlatList
                data={drills}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                extraData={selectedDrill?.id}
            />
        )}
    </View>
  );
};

export default DrillList;