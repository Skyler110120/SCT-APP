import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { dashboardStyles as comapnyCodeModal } from "@/src/styles/dashboard";
import { themes } from "@/src/context/themes";

interface OnboardingModalProps {
  isVisible: boolean;
  onSubmitCode: (code: string) => void;
}

export function OnboardingModal({
  isVisible,
  onSubmitCode,
}: OnboardingModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter a vaild code");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitCode(code.trim());
    } catch (error) {
      setError(
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to verify the invite code"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        Alert.alert(
          "Company Assignment Required",
          "You must enter a valid invite code to continue.",
          [{ text: "OK", style: "default" }]
        );
      }}
    >
      <View style={comapnyCodeModal.modalOverlay}>
        <View style={comapnyCodeModal.modalContent}>
          <Text style={comapnyCodeModal.modalTitle}>Company Onboarding</Text>

          <View style={comapnyCodeModal.formGroup}>
            <Text style={comapnyCodeModal.labelText}>
              Enter your invite code to access the application
            </Text>
            <TextInput
              style={comapnyCodeModal.textInput}
              placeholder="Enter invite code"
              placeholderTextColor={themes.white}
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
            />
            {error && <Text style={comapnyCodeModal.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[
              comapnyCodeModal.submitButton,
              isSubmitting && comapnyCodeModal.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={themes.white} size="small" />
            ) : (
              <Text style={comapnyCodeModal.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
