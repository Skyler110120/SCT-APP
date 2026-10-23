import { adminUserActionModalStyles as styles } from "@/src/styles/ManageUserPageStyles/Admin/adminUserActionModalStyles";
import { InstructorPermissionUpdate, User, UserRole } from "@/src/types/auth.types";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: "Student", value: UserRole.STUDENT },
  { label: "Instructor", value: UserRole.INSTRUCTOR },
  { label: "Admin", value: UserRole.ADMIN },
];

type PermissionFlag = Exclude<
  keyof InstructorPermissionUpdate,
  "max_students_per_session_self" | "max_students_per_session_others"
>;

const PERMISSION_OPTIONS: { key: PermissionFlag; label: string }[] = [
  { key: "can_manage_own_availability", label: "Manage own availability" },
  { key: "can_manage_own_time_off", label: "Manage own time off" },
  { key: "can_manage_others_availability", label: "Manage other instructors' availability" },
  { key: "can_manage_others_permissions", label: "Manage other instructors' permissions" },
  { key: "can_create_student_invite_codes", label: "Create student invite codes" },
  { key: "can_create_instructor_invite_codes", label: "Create instructor invite codes" },
  { key: "can_set_own_session_capacity", label: "Set own session capacity" },
  { key: "can_set_others_session_capacity", label: "Set other instructors' session capacity" },
];

interface UserActionModalProps {
  visible: boolean;
  user: User | null;
  action: "removal" | "role" | "approve" | "permissions" | "capacity";
  newRole: UserRole | null;
  setNewRole: (role: UserRole) => void;
  permissionDraft: InstructorPermissionUpdate;
  setPermissionDraft: React.Dispatch<
    React.SetStateAction<InstructorPermissionUpdate>
  >;
  capacitySelfDraft: number;
  setCapacitySelfDraft: React.Dispatch<React.SetStateAction<number>>;
  capacityOthersDraft: number;
  setCapacityOthersDraft: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  visible,
  user,
  action,
  newRole,
  setNewRole,
  permissionDraft,
  setPermissionDraft,
  capacitySelfDraft,
  setCapacitySelfDraft,
  capacityOthersDraft,
  setCapacityOthersDraft,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!user) return null;

  const isRemovalAction = action === "removal";
  const isApproveAction = action === "approve";
  const isPermissionsAction = action === "permissions";
  const isCapacityAction = action === "capacity";

  const modalTitle = isRemovalAction
    ? "Remove User from Company"
    : isApproveAction
    ? "Approve Account Access"
    : isPermissionsAction
    ? "Manage Permissions"
    : isCapacityAction
    ? "Session Capacity"
    : "Update Role";

  const confirmButtonText = isRemovalAction
    ? "Remove User"
    : isApproveAction
    ? "Approve Access"
    : isPermissionsAction
    ? "Save Permissions"
    : isCapacityAction
    ? "Save Capacity"
    : "Update Role";

  const confirmButtonStyle = isRemovalAction
    ? styles.removalButton
    : styles.confirmButton;

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
            ) : isApproveAction ? (
              <>
                <Text style={styles.confirmationText}>
                  Approve this account so they can log in?
                </Text>
                <Text style={styles.warningText}>
                  This applies to pending instructor/admin invite signups.
                </Text>
              </>
            ) : isPermissionsAction ? (
              <>
                <Text style={styles.confirmationText}>
                  Configure instructor permissions.
                </Text>
                {PERMISSION_OPTIONS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.permissionToggleRow}
                    onPress={() =>
                      setPermissionDraft((prev) => ({
                        ...prev,
                        [key]: !Boolean(prev[key]),
                      }))
                    }
                    accessibilityRole="switch"
                    accessibilityState={{ checked: Boolean(permissionDraft[key]) }}
                  >
                    <Text style={styles.permissionLabel}>{label}</Text>
                    <Text style={styles.permissionValue}>
                      {Boolean(permissionDraft[key]) ? "ON" : "OFF"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : isCapacityAction ? (
              <>
                <Text style={styles.confirmationText}>
                  Configure session capacity limits.
                </Text>
                <View style={styles.capacityRow}>
                  <Text style={styles.permissionLabel}>Own session max</Text>
                  <View style={styles.capacityStepper}>
                    <TouchableOpacity
                      style={styles.capacityButton}
                      onPress={() =>
                        setCapacitySelfDraft((value) => Math.max(1, value - 1))
                      }
                    >
                      <Text style={styles.capacityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.capacityValue}>{capacitySelfDraft}</Text>
                    <TouchableOpacity
                      style={styles.capacityButton}
                      onPress={() =>
                        setCapacitySelfDraft((value) => Math.min(50, value + 1))
                      }
                    >
                      <Text style={styles.capacityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.capacityRow}>
                  <Text style={styles.permissionLabel}>Others session max</Text>
                  <View style={styles.capacityStepper}>
                    <TouchableOpacity
                      style={styles.capacityButton}
                      onPress={() =>
                        setCapacityOthersDraft((value) => Math.max(1, value - 1))
                      }
                    >
                      <Text style={styles.capacityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.capacityValue}>{capacityOthersDraft}</Text>
                    <TouchableOpacity
                      style={styles.capacityButton}
                      onPress={() =>
                        setCapacityOthersDraft((value) => Math.min(50, value + 1))
                      }
                    >
                      <Text style={styles.capacityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.currentRole}>
                  Current Role:{" "}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
                <Text style={styles.roleLabel}>Select New Role: </Text>
                <View style={styles.roleChipRow}>
                  {ROLE_OPTIONS.map((option) => {
                    const selected = (newRole || user.role) === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.roleChip,
                          selected && styles.roleChipSelected,
                        ]}
                        onPress={() => setNewRole(option.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.roleChipText,
                            selected && styles.roleChipTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
              disabled={
                isSubmitting ||
                (!isRemovalAction &&
                  !isApproveAction &&
                  !isPermissionsAction &&
                  !isCapacityAction &&
                  newRole === user.role)
              }
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Saving..." : confirmButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UserActionModal;
