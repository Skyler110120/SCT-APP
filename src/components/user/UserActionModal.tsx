import { themes } from "@/src/context/themes";
import { manageUsersStyles as styles } from "@/src/styles/ManageUserPageStyles/manageUsers";
import { User, UserRole } from "@/src/types/auth.types";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface UserActionModalProps {
  visible: boolean;
  user: User | null;
  action: "removal" | "role";
  newRole: UserRole | null;
  setNewRole: (role: UserRole) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  visible,
  user,
  action,
  newRole,
  setNewRole,
  onConfirm,
  onCancel,
}) => {
  console.log("=== UserActionModal Debug ===");
  console.log("visible:", visible);
  console.log("user:", user);
  console.log("user?.id:", user?.id, "type:", typeof user?.id);
  console.log("action:", action);
  console.log("newRole:", newRole);
  console.log("================================");
  if (!user) return null;

  const isRemovalAction = action === "removal";

  const modalTitle = isRemovalAction
    ? "Remove User from Company"
    : "Update Role";

  const confirmButtonText = isRemovalAction ? "Remove User" : "Update Role";

  const confirmButtonStyle = isRemovalAction
    ? styles.removalButton
    : styles.confirmButton;

  console.log("UserActionModal props", { visible, user, action });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}> {modalTitle}</Text>
          <View style={styles.modalUserInfo}>
            <Text style={styles.modalUserName}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.modalUserEmail}>{user.email}</Text>

            {isRemovalAction ? (
              <>
                <Text style={styles.confirmationText}>
                  Are you sure you want to remove this user from the company?
                </Text>
                <Text style={styles.warningText}>
                  This action will revoke all access to company resources
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.currentRole}>
                  Current Role:{" "}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
                <Text style={styles.roleLabel}>Select New Role: </Text>
                <View style={styles.modalPickerContainer}>
                  <Picker
                    selectedValue={newRole || user.role}
                    onValueChange={(value) => setNewRole(value as UserRole)}
                    style={styles.modalPicker}
                    dropdownIconColor={themes.vegasGold}
                  >
                    <Picker.Item label="Student" value={UserRole.STUDENT} />
                    <Picker.Item
                      label="Instructor"
                      value={UserRole.INSTRUCTOR}
                    />
                    <Picker.Item label="Admin" value={UserRole.ADMIN} />
                  </Picker>
                </View>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={confirmButtonStyle}
              onPress={onConfirm}
              disabled={!isRemovalAction && newRole === user.role}
            >
              <Text style={styles.buttonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UserActionModal;
