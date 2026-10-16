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
  ListHeaderComponent?: React.ReactElement | null;
}

const InstructorStudentTable: React.FC<InstructorStudentTableProps> = ({
  students,
  onViewProfile,
  isLoading = false,
  ListHeaderComponent = null,
}: InstructorStudentTableProps) => {
  const formatName = (student: User): string => {
    return `${student.first_name} ${student.last_name}`;
  };

  const getStatusBadge = (student: User) => {
    if (!student.is_active) {
      return { text: "Inactive", color: themes.black };
    }
    return { text: "Active", color: themes.black };
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

  const listHeader = (
    <View>
      {ListHeaderComponent}
      <Text style={styles.tableSectionTitle}>
        My Students ({students.length})
      </Text>
    </View>
  );

  return (
    <View style={styles.tableContainer}>
      <FlatList
        style={{ flex: 1 }}
        data={students}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          students.length === 0 && { flexGrow: 1 },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <FontAwesome
                name="users"
                size={48}
                color={themes.vegasGold}
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyStateText}>No students found</Text>
              <Text
                style={[styles.emptyStateText, { fontSize: 14, marginTop: 8 }]}
              >
                Try clearing your search or choosing a different status filter.
              </Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default InstructorStudentTable;
