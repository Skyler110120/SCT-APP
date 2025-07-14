import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { themes } from "@/src/context/themes";
import { adminManageUsersStyles as styles } from "@/src/styles/adminManageUsers";
import { User, UserRole } from "@/src/types/auth.types";

interface UserTableProps {
  users: User[];
  onRemoveAction: (user: User) => void;
  onRoleAction: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onRemoveAction,
  onRoleAction,
}) => {
  const formatName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim();
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    let backgroundColor;
    let textColor = themes.black;

    if (role === UserRole.ADMIN) {
      backgroundColor = themes.vegasGold;
    } else if (role === UserRole.INSTRUCTOR) {
      backgroundColor = "rgba(218, 165, 32, 0.6)";
    } else if (role === UserRole.STUDENT) {
      backgroundColor = "rgba(218, 165, 32, 0.3)";
    } else {
      backgroundColor = themes.white;
      textColor = themes.black;
    }

    return {
      ...styles.roleBadge,
      backgroundColor,
      borderColor: themes.vegasGold,
      borderWidth: 1,
    };
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{formatName(item)}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={getRoleBadgeStyle(item.role)}>
            <Text style={styles.roleBadgeText}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRoleAction(item)}
        >
          <FontAwesome name="user" size={16} color={themes.vegasGold} />
          <Text style={styles.actionText}>Change Role</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRemoveAction(item)}
        >
          <FontAwesome
            name="user-times"
            size={16}
            color={item.is_active ? "#FF4444" : themes.vegasGold}
          />
          <Text
            style={[
              styles.actionText,
              styles.removeText
            ]}
          >
           Remove from Company
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.tableSectionTitle}> Users: ({users.length})</Text>
      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default UserTable;