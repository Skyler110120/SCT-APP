import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, useRouter } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import Images from "@/src/assets/images";
import { themes } from "@/src/context/themes";
import { onboardingInviteService } from "@/src/services/onboardingInviteService";
import { authService } from "@/src/services/authService";
import type { InviteTokenValidation } from "@/src/types/onboardingInvite.types";

type Step = "validating" | "registration" | "error";

/** Email invite join flow: validate token → register (no OTP). */
export default function JoinInviteScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [step, setStep] = useState<Step>("validating");
  const [inviteData, setInviteData] = useState<InviteTokenValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMessage("No invite token provided.");
      setStep("error");
      return;
    }

    (async () => {
      const result = await onboardingInviteService.validateInviteToken(token);
      if (result.success && result.data?.valid) {
        setInviteData(result.data);
        setStep("registration");
      } else {
        setErrorMessage("This invite link is invalid or has expired.");
        setStep("error");
      }
    })();
  }, [token]);

  const handleSignup = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsRegistering(true);
    try {
      const result = await onboardingInviteService.signupFromInvite({
        invite_token: token!,
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (result.success) {
        const loginResult = await authService.login({
          email: email.trim().toLowerCase(),
          password,
        });

        if (loginResult.success) {
          Alert.alert(
            "Welcome!",
            `You've joined ${inviteData?.company_name || "the company"}.`,
            [{ text: "Continue", onPress: () => router.replace("/(app)/dashboard") }]
          );
        } else {
          Alert.alert(
            "Account Created",
            "Your account was created. Please log in.",
            [{ text: "Go to Login", onPress: () => router.replace("/login") }]
          );
        }
      } else {
        Alert.alert("Registration Failed", result.error || "Failed to create account");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsRegistering(false);
    }
  }, [token, email, password, confirmPassword, firstName, lastName, inviteData, router]);

  if (step === "validating") {
    return (
      <BackgroundGradient>
        <SafeAreaView style={s.centered}>
          <ActivityIndicator size="large" color={themes.vegasGold} />
          <Text style={s.loadingText}>Validating your invite...</Text>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  if (step === "error") {
    return (
      <BackgroundGradient>
        <SafeAreaView style={s.centered}>
          <Image source={Images.logo.sctLogo} style={s.logo} />
          <Text style={s.errorTitle}>Invite Link Error</Text>
          <Text style={s.errorBody}>{errorMessage}</Text>
          <TouchableOpacity style={s.primaryButton} onPress={() => router.replace("/login")}>
            <Text style={s.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.backRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={Images.buttons.backButton} />
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
          extraHeight={120}
          keyboardOpeningTime={0}
        >
          <Image source={Images.logo.sctLogo} style={s.logo} />

          {inviteData && (
            <View style={s.welcomeBox}>
              <Text style={s.welcomeTitle}>
                Join {inviteData.company_name}
              </Text>
              <Text style={s.welcomeSub}>
                as {inviteData.role?.toLowerCase() || "a member"}
              </Text>
            </View>
          )}

          {step === "registration" && (
            <View style={s.formWrap}>
              <Text style={s.stepLabel}>Create Your Account</Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="First Name"
                  placeholderTextColor="rgba(197,179,88,0.5)"
                  value={firstName}
                  onChangeText={setFirstName}
                  returnKeyType="next"
                />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Last Name"
                  placeholderTextColor="rgba(197,179,88,0.5)"
                  value={lastName}
                  onChangeText={setLastName}
                  returnKeyType="next"
                />
              </View>

              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor="rgba(197,179,88,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor="rgba(197,179,88,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />

              <TextInput
                style={s.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(197,179,88,0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />

              <TouchableOpacity
                style={[s.primaryButton, { opacity: isRegistering ? 0.5 : 1 }]}
                onPress={handleSignup}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator color={themes.white} />
                ) : (
                  <Text style={s.primaryButtonText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const s = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: "Chakra-Regular",
    fontSize: 16,
    color: themes.white,
  },
  logo: {
    width: 120,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontFamily: "Chakra-Bold",
    fontSize: 24,
    color: themes.vegasGold,
    marginTop: 20,
    textAlign: "center",
  },
  errorBody: {
    fontFamily: "Chakra-Regular",
    fontSize: 16,
    color: themes.white,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  welcomeBox: {
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  welcomeTitle: {
    fontFamily: "Chakra-Bold",
    fontSize: 22,
    color: themes.white,
    textAlign: "center",
  },
  welcomeSub: {
    fontFamily: "Chakra-Regular",
    fontSize: 14,
    color: themes.white,
    textAlign: "center",
    marginTop: 4,
  },
  formWrap: {
    width: "100%",
    gap: 16,
  },
  stepLabel: {
    fontFamily: "Chakra-Italic",
    fontSize: 18,
    color: themes.vegasGold,
    textAlign: "center",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    color: themes.vegasGold,
    fontSize: 16,
    fontFamily: "Chakra-Italic",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    marginTop: 4,
    backgroundColor: themes.vegasGold,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontFamily: "Chakra-semiBoldItalic",
    fontSize: 20,
    color: themes.white,
  },
});
