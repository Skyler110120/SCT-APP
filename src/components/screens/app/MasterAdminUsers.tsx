import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import UserActionModal from "@/src/components/user/AdminUserActionModal";
import UserFilters from "@/src/components/user/AdminUserFilters";
import UserTable from "@/src/components/user/AdminUserTable";
import { themes } from "@/src/context/themes";
import { userService } from "@/src/services/userService";
import { adminManageUsersStyles as styles } from "@/src/styles/ManageUserPageStyles/Admin/adminManageUsersStyles";
import { User } from "@/src/types/auth.types";
import { UserRole } from "@/src/types/enums";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MasterAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"removal" | "role">("role");
  const [newRole, setNewRole] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.first_name.toLowerCase().includes(query) ||
          entry.last_name.toLowerCase().includes(query) ||
          entry.email.toLowerCase().includes(query) ||
          entry.role.toLowerCase().includes(query)
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((entry) => entry.role === roleFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || "Failed to load users");
      }
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleAction = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActionType("role");
    setModalVisible(true);
  };

  const handleRemoveAction = (user: User) => {
    setSelectedUser(user);
    setActionType("removal");
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    try {
      if (actionType === "role" && newRole) {
        const response = await userService.updateUserRole(selectedUser.id, newRole);
        if (response.success) {
          setUsers((previous) =>
            previous.map((entry) =>
              entry.id === selectedUser.id ? { ...entry, role: newRole } : entry
            )
          );
          Alert.alert("Success", `${selectedUser.first_name}'s role was updated.`);
        } else {
          Alert.alert("Error", response.error || "Failed to update role");
        }
      } else if (actionType === "removal") {
        if (!selectedUser.company_id) {
          Alert.alert("Error", "This user is not assigned to a company");
          return;
        }
        const response = await userService.removeUserFromCompany(
          selectedUser.company_id,
          selectedUser.id
        );
        if (response.success) {
          setUsers((previous) =>
            previous.filter((entry) => entry.id !== selectedUser.id)
          );
          Alert.alert("Success", `${selectedUser.first_name} was removed.`);
        } else {
          Alert.alert("Error", response.error || "Failed to remove user");
        }
      }
    } catch (actionError) {
      console.error("Error handling user action:", actionError);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setModalVisible(false);
      setSelectedUser(null);
      setNewRole(null);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.pageTitle}>Manage Users</Text>

            <UserFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />

            <View style={styles.tableSection}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                  <Text style={styles.loadingText}>Loading users...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <UserTable
                  users={filteredUsers}
                  onRemoveAction={handleRemoveAction}
                  onRoleAction={handleRoleAction}
                />
              )}
            </View>
          </View>
        </SafeAreaView>

        {selectedUser && (
          <UserActionModal
            visible={modalVisible}
            user={selectedUser}
            action={actionType}
            newRole={newRole}
            setNewRole={setNewRole}
            onConfirm={handleConfirmAction}
            onCancel={() => setModalVisible(false)}
          />
        )}

        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
