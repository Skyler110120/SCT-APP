import { themes } from "@/src/context/themes";
import { drillListStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/drillListStyles";
import { Drill, FireType } from "@/src/types/course.drills.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface DrillListProps {
  drills: Drill[];
  selectedDrill: Drill | null;
  onSelectDrill: (drill: Drill) => void;
  onEditDrill: (drill: Drill) => void;
  onDeleteDrill: (drill: Drill) => void;
  isLoading: boolean;
}

const DrillList: React.FC<DrillListProps> = ({
  drills,
  selectedDrill,
  onSelectDrill,
  onEditDrill,
  onDeleteDrill,
}) => {
  const formatFireType = (type: FireType) => {
    if (type === FireType.LIVE_FIRE) return "Live Fire";
    if (type === FireType.DRY_FIRE) return "Dry Fire";
    return type;
  };

  const renderItem = ({ item }: { item: Drill }) => {
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
          <Text style={styles.name}>{item.name}</Text>
          {item.purpose && (
            <Text style={styles.description} numberOfLines={2}>{item.purpose}</Text>
          )}

          <View style={styles.details}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatFireType(item.fire_type)}</Text>
            </View>
            {item.is_cte && (
              <View style={[styles.badge, { borderColor: "#FFD700" }]}>
                <Text style={[styles.badgeText, { color: "#FFD700" }]}>CTE</Text>
              </View>
            )}
            {item.passing_standard && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Std: {item.passing_standard}</Text>
              </View>
            )}
            {item.fundamentals.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.fundamentals.map((f) => f.name).join(", ")}
                </Text>
              </View>
            )}
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
                {item.is_active ? "Active" : "Inactive"}
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
              Deactivate
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableSectionTitle}>
        Platform Drills ({drills.length})
      </Text>

      {drills.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No drills found</Text>
          <Text
            style={[styles.emptyStateText, { marginTop: 8, opacity: 0.7 }]}
          >
            Create your first drill to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={drills}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1 }}
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
