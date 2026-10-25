import { themes } from "@/src/context/themes";
import { inviteCodeModalStyles as styles } from "@/src/styles/RegisterPageStyles/inviteCodeModalStyles";
import { CompanyInfo } from "@/src/types/onboarding.types";
import { UserRole } from "@/src/types/enums";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { onboardingService } from "../../services/onboardingService";
import { AuthBrandLockup } from "@/src/components/auth/AuthBrandLockup";

interface InviteCodeModalProps {
  isVisible: boolean;
  onValidateSuccess: (companyInfo: CompanyInfo) => void;
  onCancel: () => void;
  /** Company resolved from an SMS/onboarding join link; codes for other companies are rejected. */
  linkedCompany?: { id: number; name: string } | null;
  initialCode?: string;
}
export function InviteCodeModal({
  isVisible,
  onValidateSuccess,
  onCancel,
  linkedCompany,
  initialCode = "",
}: InviteCodeModalProps) {
  const [code, setCode] = useState(initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      console.log("Validating invite code for registration...");

      const result = await onboardingService.validateCompanyCode(code.trim());

      if (result.success && result.data) {
        console.log("Invite code valid for company:", result.data.company_name);

        if (linkedCompany && result.data.company_id !== linkedCompany.id) {
          setError(
            "This invite code does not match the company from your onboarding link. Please use a matching code."
          );
          return;
        }

        onValidateSuccess(result.data);

        setCode("");
        setError(null);
      } else {
        console.log("Invite code validation failed:", result.error);
        setError(result.error || "Invalid invite code. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error validating invite code:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    console.log("User cancelled invite code entry");

    setCode("");
    setError(null);
    onCancel();
  };

  const handleModalClose = () => {
    Alert.alert(
      "Cancel Registration?",
      "You need a valid invite code to create an account. Do you want to cancel registration?",
      [
        { text: "Continue", style: "cancel" },
        {
          text: "Cancel Registration",
          style: "destructive",
          onPress: handleCancel,
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.brandSlot}>
            <AuthBrandLockup compact markOnly />
          </View>
          <Text style={styles.modalTitle}>Join Your Company</Text>

          <View style={styles.formGroup}>
            <Text style={styles.labelText}>
              Enter the invite code provided by your organization to begin
              registration
            </Text>
            {linkedCompany && (
              <Text style={styles.labelText}>
                Link detected for {linkedCompany.name}. Use a matching invite code to continue.
              </Text>
            )}

            <TextInput
              style={[styles.textInput, error && styles.errorText]}
              placeholder="Enter invite code"
              placeholderTextColor={themes.textMuted}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isValidating}
              onSubmitEditing={handleValidateCode}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isValidating && styles.disabledButton,
              ]}
              onPress={handleValidateCode}
              disabled={isValidating}
            >
              {isValidating ? (
                <ActivityIndicator color={themes.accentForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isValidating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
