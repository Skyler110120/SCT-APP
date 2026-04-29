import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { authService } from "@/src/services/authService";
import { themes } from "@/src/context/themes";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = useMemo(() => (typeof params.token === "string" ? params.token : ""), [params.token]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }
      const result = await authService.validatePasswordResetToken(token);
      setIsTokenValid(result.success && result.valid);
      setIsValidating(false);
    };
    void validate();
  }, [token]);

  const handleReset = async () => {
    if (!isTokenValid) {
      Alert.alert("Invalid Link", "This reset link is invalid or expired.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill out both password fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Invalid Password", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({
        token,
        new_password: newPassword,
      });
      if (!res.success) {
        Alert.alert("Error", res.error ?? "Failed to reset password.");
        return;
      }
      Alert.alert("Success", res.message ?? "Password reset successfully.");
      router.replace("/login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Choose a new password for your account.</Text>

              {isValidating ? (
                <ActivityIndicator color={themes.vegasGold} />
              ) : !isTokenValid ? (
                <Text style={styles.errorText}>This reset link is invalid or expired.</Text>
              ) : (
                <>
                  <TextInput
                    placeholder="New password"
                    placeholderTextColor={themes.vegasGold}
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                  <TextInput
                    placeholder="Confirm new password"
                    placeholderTextColor={themes.vegasGold}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleReset}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={themes.white} />
                    ) : (
                      <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.4)",
    borderRadius: 16,
    backgroundColor: "rgba(8,8,8,0.8)",
    padding: 18,
    gap: 12,
  },
  title: {
    color: themes.white,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
  },
  subtitle: {
    color: themes.lightGray,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
    color: themes.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Chakra-Regular",
  },
  errorText: {
    color: "#fca5a5",
    fontFamily: "Chakra-Regular",
    fontSize: 14,
  },
  button: {
    marginTop: 4,
    backgroundColor: themes.vegasGold,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: themes.white,
    fontFamily: "Chakra-Bold",
    fontSize: 16,
  },
  linkText: {
    color: themes.vegasGold,
    textAlign: "center",
    textDecorationLine: "underline",
    fontFamily: "Chakra-Regular",
    marginTop: 6,
  },
});
