import { themes } from "@/src/context/themes";
import { manageUsersStyles as styles } from "@/src/styles/ManageUserPageStyles/manageUsers";
import { User } from "@/src/types/auth.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

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

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{formatName(item)}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={styles.roleBadge}>
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
          <FontAwesome name="user" size={20} color={themes.vegasGold} />
          <Text style={styles.actionText}>Change Role</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRemoveAction(item)}
        >
          <FontAwesome
            name="user-times"
            size={20}
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