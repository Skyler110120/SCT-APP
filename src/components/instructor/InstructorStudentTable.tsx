import { themes } from "@/src/context/themes";
import { instructorStudentTableStyles as styles } from "@/src/styles/ManageUserPageStyles/Instructor/instructorStudentTableStyles";
import { User } from "@/src/types/auth.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface InstructorStudentTableProps {
  students: User[];
  onViewProfile: (student: User) => void;
  isLoading?: boolean;
}

const InstructorStudentTable: React.FC<InstructorStudentTableProps> = ({
  students,
  onViewProfile,
  isLoading = false,
}: InstructorStudentTableProps) => {
  const formatName = (student: User): string => {
    return `${student.first_name} ${student.last_name}`;
  };

  const getStatusBadge = (student: User) => {
    if (!student.is_active) {
      return { text: "Inactive", color: themes.black };
    } else {
      return { text: "Active", color: themes.black };
    }
  };

  const renderItem = ({ item }: { item: User }) => {
    const status = getStatusBadge(item);

    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {formatName(item)}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>

          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: status.color }]}>
              <Text style={styles.roleBadgeText}>{status.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onViewProfile(item)}
            disabled={isLoading}
          >
            <FontAwesome name="user" size={24} color={themes.vegasGold} />
            <Text style={styles.actionText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableSectionTitle}>
        My Students ({students.length})
      </Text>

      {students.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <FontAwesome
            name="users"
            size={48}
            color={themes.vegasGold}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyStateText}>No students assigned</Text>
          <Text style={[styles.emptyStateText, { fontSize: 14, marginTop: 8 }]}>
            Students will appear here when they're assigned to you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default InstructorStudentTable;
