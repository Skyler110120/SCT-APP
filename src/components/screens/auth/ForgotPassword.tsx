import React, { useState } from "react";
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
import { useRouter } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { authService } from "@/src/services/authService";
import { themes } from "@/src/context/themes";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your account email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.requestPasswordReset({ email: email.trim() });
      if (!res.success) {
        Alert.alert("Error", res.error ?? "Failed to request password reset.");
        return;
      }
      Alert.alert(
        "Check Your Email",
        res.message ?? "If an account exists for that email, a reset link has been sent."
      );
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
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your account email and we will send you a reset link.
              </Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor={themes.vegasGold}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
              />
              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={themes.white} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
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
