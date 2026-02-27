import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { smsInviteService } from "@/src/services/smsInviteService";
import { authService } from "@/src/services/authService";
import type { InviteTokenValidation } from "@/src/types/smsOnboarding.types";

type Step = "validating" | "verify-phone" | "registration" | "error";

export default function SmsJoinScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [step, setStep] = useState<Step>("validating");
  const [inviteData, setInviteData] = useState<InviteTokenValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationSessionToken, setVerificationSessionToken] = useState("");

  // Registration form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Validate invite token on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("No invite token provided.");
      setStep("error");
      return;
    }

    (async () => {
      const result = await smsInviteService.validateInviteToken(token);
      if (result.success && result.data?.valid) {
        setInviteData(result.data);
        if (result.data.phone_e164) {
          setPhoneNumber(result.data.phone_e164);
        }
        setStep("verify-phone");
      } else {
        setErrorMessage("This invite link is invalid or has expired.");
        setStep("error");
      }
    })();
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    cooldownRef.current = id;
    return () => clearInterval(id);
  }, [cooldown]);

  const handleRequestOtp = useCallback(async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setIsRequestingOtp(true);
    try {
      const result = await smsInviteService.requestOtp({
        phone_number: phoneNumber.trim(),
        purpose: "onboarding_invite",
        invite_token: token,
      });

      if (result.success && result.data?.success) {
        setOtpSent(true);
        setCooldown(result.data.cooldown_seconds || 30);
      } else {
        Alert.alert("Error", result.error || "Failed to send verification code");
      }
    } catch {
      Alert.alert("Error", "Failed to send verification code");
    } finally {
      setIsRequestingOtp(false);
    }
  }, [phoneNumber, token]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await smsInviteService.verifyOtp({
        phone_number: phoneNumber.trim(),
        otp_code: otpCode.trim(),
        purpose: "onboarding_invite",
        invite_token: token,
      });

      if (result.success && result.data?.verified && result.data.verification_session_token) {
        setVerificationSessionToken(result.data.verification_session_token);
        setStep("registration");
      } else {
        Alert.alert("Verification Failed", result.data?.error || result.error || "Invalid code. Please try again.");
        setOtpCode("");
      }
    } catch {
      Alert.alert("Error", "Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [otpCode, phoneNumber, token]);

  const handleSignup = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields");
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
      const result = await smsInviteService.signupFromInvite({
        invite_token: token!,
        verification_session_token: verificationSessionToken,
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (result.success) {
        // Auto-login after successful registration
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
  }, [token, verificationSessionToken, email, password, confirmPassword, firstName, lastName, inviteData, router]);

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

          {step === "verify-phone" && (
            <View style={s.formWrap}>
              <Text style={s.stepLabel}>Step 1: Verify Your Phone</Text>

              <TextInput
                style={s.input}
                placeholder="Phone number (e.g. +15551234567)"
                placeholderTextColor="rgba(197,179,88,0.5)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!inviteData?.phone_e164}
              />

              {!otpSent ? (
                <TouchableOpacity
                  style={[s.primaryButton, { opacity: isRequestingOtp ? 0.5 : 1 }]}
                  onPress={handleRequestOtp}
                  disabled={isRequestingOtp}
                >
                  {isRequestingOtp ? (
                    <ActivityIndicator color={themes.white} />
                  ) : (
                    <Text style={s.primaryButtonText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={s.helperText}>
                    Enter the 6-digit code sent to {phoneNumber}
                  </Text>

                  <TextInput
                    style={[s.input, { textAlign: "center", letterSpacing: 8, fontSize: 24 }]}
                    placeholder="000000"
                    placeholderTextColor="rgba(197,179,88,0.3)"
                    value={otpCode}
                    onChangeText={(t) => setOtpCode(t.replace(/\D/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={[s.primaryButton, { opacity: isVerifyingOtp || otpCode.length < 6 ? 0.5 : 1 }]}
                    onPress={handleVerifyOtp}
                    disabled={isVerifyingOtp || otpCode.length < 6}
                  >
                    {isVerifyingOtp ? (
                      <ActivityIndicator color={themes.white} />
                    ) : (
                      <Text style={s.primaryButtonText}>Verify Code</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRequestOtp}
                    disabled={cooldown > 0 || isRequestingOtp}
                    style={{ marginTop: 12, alignItems: "center" }}
                  >
                    <Text style={{
                      fontFamily: "Chakra-Regular",
                      fontSize: 14,
                      color: cooldown > 0 ? "rgba(255,255,255,0.3)" : themes.vegasGold,
                    }}>
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {step === "registration" && (
            <View style={s.formWrap}>
              <Text style={s.stepLabel}>Step 2: Create Your Account</Text>

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
  helperText: {
    fontFamily: "Chakra-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
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
