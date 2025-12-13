import { themes } from "@/src/context/themes";
import { dashboardStyles as styles } from "@/src/styles/DashboardPageStyles/instructorDashboard";
import { CompanyInfo } from "@/src/types/onboarding.types";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { onboardingService } from "../../services/onboardingService";

interface InviteCodeModalProps {
  isVisible: boolean;
  onValidateSuccess: (companyInfo: CompanyInfo) => void;
  onCancel: () => void;
}
export function InviteCodeModal({
  isVisible,
  onValidateSuccess,
  onCancel,
}: InviteCodeModalProps) {
  const [code, setCode] = useState("");
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

        onValidateSuccess(result.data);

        setCode("");
        setError(null);

        Alert.alert(
          "Welcome!",
          `You're joining ${result.data.company_name}. Please complete your registration.`,
          [{ text: "Continue", style: "default" }]
        );
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
        setError("An unexpected error occured. Please try again.");
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Join Your Company</Text>

          <View style={styles.formGroup}>
            <Text style={styles.labelText}>
              Enter the invite code provided by your organization to begin
              registration
            </Text>

            <TextInput
              style={[styles.textInput, error && styles.errorText]}
              placeholder="Enter invite code"
              placeholderTextColor={themes.white}
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
                <ActivityIndicator color={themes.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCancel}
              disabled={isValidating}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
