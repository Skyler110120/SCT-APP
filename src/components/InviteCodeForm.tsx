import { themes } from "@/src/context/themes";
import { inviteCodeFormStyles as inviteCodeForm } from "@/src/styles/DashboardPageStyles/inviteCodeFormStyles";
import { Company } from "@/src/types/company.types";
import { UserRole } from "@/src/types/enums"
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      <View style={inviteCodeForm.modalOverlay}>
        <View style={inviteCodeForm.modalContent}>
          <Text style={inviteCodeForm.modalTitle}>
            Create Invite Code for {company.name}
          </Text>
          <Text style={inviteCodeForm.inputLabel}>
            This will create a new invite code that:
          </Text>
          <Text style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Can be used once
          </Text>
          <Text style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Will expire in 3 days
          </Text>
          <Text style={[inviteCodeForm.inputLabel, { marginLeft: 12 }]}>
            • Will allow a new user to join this company
          </Text>
          <View style={inviteCodeForm.buttonContainer}>
            <TouchableOpacity
              style={inviteCodeForm.actionButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={inviteCodeForm.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                inviteCodeForm.actionButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              
              onPress={() => onSubmit(UserRole.STUDENT)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text style={inviteCodeForm.buttonText}>
                  Create Student Invite Code
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                inviteCodeForm.actionButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={() => onSubmit(UserRole.INSTRUCTOR)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text style={inviteCodeForm.buttonText}>
                  Create Instructor Invite Code
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                inviteCodeForm.actionButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={() => onSubmit(UserRole.ADMIN)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text style={inviteCodeForm.buttonText}>
                  Create Admin Invite Code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteCodeForm;
