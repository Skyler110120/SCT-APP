import { inviteCodeFormStyles as inviteCodeForm } from "@/src/styles/DashboardPageStyles/inviteCodeFormStyles";
import { Company } from "@/src/types/company.types";
import { UserRole } from "@/src/types/enums";
import React from "react";
import {
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { AppButton, AppCard, AppText } from "@/src/components/ui";
import { theme } from "@/src/context/themes";

interface InviteCodeFormProps {
  visible: boolean;
  company: Company;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (selectedRole: UserRole) => void;
}

const InviteCodeForm = ({
  visible,
  company,
  isSubmitting = false,
  onClose,
  onSubmit,
}: InviteCodeFormProps) => {
  if (!company) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <AppCard style={styles.modalContent} variant="elevated">
          <AppText variant="title" style={inviteCodeForm.modalTitle}>
            Create Invite Code for {company.name}
          </AppText>
          <AppText style={inviteCodeForm.inputLabel}>
            This will create a new invite code that:
          </AppText>
          <AppText style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Can be used once
          </AppText>
          <AppText style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Will expire in 3 days
          </AppText>
          <AppText style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Will allow a new user to join this company
          </AppText>
          <AppText style={[inviteCodeForm.inputLabel, { marginTop: 8 }]}>
            Choose the role for the new user:
          </AppText>
          <View style={inviteCodeForm.buttonContainer}>
            <AppButton
              label="Cancel"
              variant="outline"
              style={styles.button}
              onPress={onClose}
              disabled={isSubmitting}
            />
            <AppButton
              label="Student"
              style={styles.button}
              isLoading={isSubmitting}
              onPress={() => onSubmit(UserRole.STUDENT)}
              disabled={isSubmitting}
            />
            <AppButton
              label="Instructor"
              style={styles.button}
              isLoading={isSubmitting}
              onPress={() => onSubmit(UserRole.INSTRUCTOR)}
              disabled={isSubmitting}
            />
            <AppButton
              label="Admin"
              style={styles.button}
              isLoading={isSubmitting}
              onPress={() => onSubmit(UserRole.ADMIN)}
              disabled={isSubmitting}
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
};

export default InviteCodeForm;

const styles = StyleSheet.create({
  modalOverlay: {
    ...inviteCodeForm.modalOverlay,
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.space.lg,
  },
  modalContent: {
    ...inviteCodeForm.modalContent,
    width: "100%",
    maxWidth: 480,
  },
  button: {
    flex: 1,
  },
});
