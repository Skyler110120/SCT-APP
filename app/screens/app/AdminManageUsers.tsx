import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { adminManageUsersStyles as styles } from "@/src/styles/adminManageUsers";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import UserTable from "@/src/components/user/UserTable";
import UserFilters from "@/src/components/user/UserFilters";
import UserActionModal from "@/src/components/user/UserActionModal";
import { useAuth } from "@/src/context/AuthContext";
import { userService } from "@/src/services/userService";
import { User, UserRole } from "@/src/types/auth.types";
import { themes } from "@/src/context/themes";

export default function AdminManageUsers() {
  const { user } = useAuth();

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
    if (user?.company_id) {
      fetchUsers(user.company_id);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async (companyId: number) => {
    setIsLoading(true);
    try {
      const response = await userService.getAllUsers(companyId);

      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        Alert.alert("Error", "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleAction = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActionType("role");
    setModalVisible(true);
  };

  const handleRemoveAction = (user: User) => {
    console.log("handleRemoveAction called", user);
    setSelectedUser(user);
    setActionType("removal");
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === "role" && newRole) {
        const response = await userService.updateUserRole(
          selectedUser.id,
          newRole
        );

        if (response.success) {
          setUsers(
            users.map((u) =>
              u.id === selectedUser.id ? { ...u, role: newRole } : u
            )
          );

          Alert.alert(
            "Success",
            `${selectedUser.first_name}'s role has been updated to ${newRole}`
          );
        } else {
          Alert.alert("Error", response.error || "Failed to update user role");
        }
      } else if (actionType === "removal") {
        if (!selectedUser.company_id) {
          Alert.alert("Error", "User does not belong to any company");
          return;
        }
        const response = await userService.removeUserFromCompany(selectedUser.company_id, selectedUser.id);

        if (response.success) {
          setUsers(users.filter((u) => u.id !== selectedUser.id));

          Alert.alert(
            "Success",
            `${selectedUser.first_name} has been removed from the company`
          );
        } else {
          Alert.alert("Error", response.error || "Failed to remove user");
        }
      }
    } catch (error) {
      console.error("Error handling user action:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setModalVisible(false);
      setSelectedUser(null);
      setNewRole(null);
    }
  };

  const handleCancelAction = () => {
    setModalVisible(false);
    setSelectedUser(null);
    setNewRole(null);
  };

  const handleRetryFetch = () => {
    if (user?.company_id) {
      fetchUsers(user.company_id);
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
              {isLoading && users.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                  <Text style={styles.loadingText}>Loading users...</Text>
                </View>
              ) : error && users.length === 0 ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetryFetch}
                  >
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

              {isLoading && users.length > 0 && (
                <View
                  style={[
                    styles.loadingContainer,
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                  ]}
                >
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                </View>
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
                onCancel={handleCancelAction}
            />
        )}
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
