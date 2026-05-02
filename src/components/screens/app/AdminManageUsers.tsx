import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import UserActionModal from "@/src/components/user/AdminUserActionModal";
import UserFilters from "@/src/components/user/AdminUserFilters";
import UserTable from "@/src/components/user/AdminUserTable";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { userService } from "@/src/services/userService";
import { adminManageUsersStyles as styles } from "@/src/styles/ManageUserPageStyles/Admin/adminManageUsersStyles";
import { InstructorPermissionUpdate, User } from "@/src/types/auth.types";
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
  const [actionType, setActionType] = useState<
    "removal" | "role" | "approve" | "permissions" | "capacity"
  >("role");
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [permissionDraft, setPermissionDraft] =
    useState<InstructorPermissionUpdate>({});
  const [capacitySelfDraft, setCapacitySelfDraft] = useState<number>(4);
  const [capacityOthersDraft, setCapacityOthersDraft] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;
  const canManageInstructorPermissions =
    isAdmin ||
    (user?.role === UserRole.INSTRUCTOR &&
      Boolean(user.can_manage_others_permissions));
  const canManageInstructorCapacity =
    isAdmin ||
    (user?.role === UserRole.INSTRUCTOR &&
      Boolean(user.can_set_others_session_capacity));

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
    setSelectedUser(user);
    setActionType("removal");
    setModalVisible(true);
  };

  const handleApproveAction = (user: User) => {
    setSelectedUser(user);
    setActionType("approve");
    setModalVisible(true);
  };

  const buildPermissionDraft = (targetUser: User): InstructorPermissionUpdate => ({
    can_manage_own_availability: targetUser.can_manage_own_availability,
    can_manage_own_time_off: targetUser.can_manage_own_time_off,
    can_manage_others_availability: targetUser.can_manage_others_availability,
    can_manage_others_permissions: targetUser.can_manage_others_permissions,
    can_create_student_invite_codes: targetUser.can_create_student_invite_codes,
    can_create_instructor_invite_codes:
      targetUser.can_create_instructor_invite_codes,
    can_set_own_session_capacity: targetUser.can_set_own_session_capacity,
    can_set_others_session_capacity: targetUser.can_set_others_session_capacity,
  });

  const handlePermissionsAction = (targetUser: User) => {
    setSelectedUser(targetUser);
    setActionType("permissions");
    setPermissionDraft(buildPermissionDraft(targetUser));
    setModalVisible(true);
  };

  const handleCapacityAction = (targetUser: User) => {
    setSelectedUser(targetUser);
    setActionType("capacity");
    setCapacitySelfDraft(targetUser.max_students_per_session_self ?? 4);
    setCapacityOthersDraft(targetUser.max_students_per_session_others ?? 4);
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
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
      } else if (actionType === "approve") {
        const response = await userService.approveUserAccount(selectedUser.id);
        if (response.success && response.data) {
          setUsers(users.map((u) => (u.id === selectedUser.id ? response.data! : u)));
          Alert.alert(
            "Success",
            `${selectedUser.first_name}'s account has been approved`
          );
        } else {
          Alert.alert("Error", response.error || "Failed to approve user account");
        }
      } else if (actionType === "permissions") {
        const response = await userService.updateInstructorPermissions(
          selectedUser.id,
          permissionDraft
        );
        if (response.success && response.data) {
          setUsers(
            users.map((u) => (u.id === selectedUser.id ? response.data! : u))
          );
          Alert.alert("Success", "Instructor permissions updated");
        } else {
          Alert.alert(
            "Error",
            response.error || "Failed to update instructor permissions"
          );
        }
      } else if (actionType === "capacity") {
        const response = await userService.updateInstructorPermissions(
          selectedUser.id,
          {
            max_students_per_session_self: capacitySelfDraft,
            max_students_per_session_others: capacityOthersDraft,
          }
        );
        if (response.success && response.data) {
          setUsers(
            users.map((u) => (u.id === selectedUser.id ? response.data! : u))
          );
          Alert.alert("Success", "Session capacity updated");
        } else {
          Alert.alert(
            "Error",
            response.error || "Failed to update session capacity"
          );
        }
      }
    } catch (error) {
      console.error("Error handling user action:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      setModalVisible(false);
      setSelectedUser(null);
      setNewRole(null);
      setPermissionDraft({});
      setCapacitySelfDraft(4);
      setCapacityOthersDraft(4);
    }
  };

  const handleCancelAction = () => {
    setModalVisible(false);
    setSelectedUser(null);
    setNewRole(null);
    setPermissionDraft({});
    setCapacitySelfDraft(4);
    setCapacityOthersDraft(4);
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
                  onApproveAction={handleApproveAction}
                  onPermissionsAction={handlePermissionsAction}
                  onCapacityAction={handleCapacityAction}
                  canManageInstructorPermissions={canManageInstructorPermissions}
                  canManageInstructorCapacity={canManageInstructorCapacity}
                  currentUserId={user?.id}
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
                permissionDraft={permissionDraft}
                setPermissionDraft={setPermissionDraft}
                capacitySelfDraft={capacitySelfDraft}
                setCapacitySelfDraft={setCapacitySelfDraft}
                capacityOthersDraft={capacityOthersDraft}
                setCapacityOthersDraft={setCapacityOthersDraft}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
            />
        )}
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
