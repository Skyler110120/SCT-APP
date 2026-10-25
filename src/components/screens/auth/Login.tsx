import { useAuth } from "@/src/context/AuthContext";
import { LoginCredentials } from "@/src/types/auth.types";
import { loginScreenStyles as styles } from "@/src/styles/LoginPageStyles/loginScreenStyles";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Images from "@/src/assets/images";
import { AppButton, AppInput, AppScreen, AppText } from "@/src/components/ui";
import { AuthGridBackground } from "@/src/components/auth/AuthGridBackground";
import { Feather } from "@expo/vector-icons";
import { themes } from "@/src/context/themes";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value
    }));
    if (loginError) {
      setLoginError("");
    }
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    setIsLoading(true);
    setLoginError("");
    try {
      const result = await login({
        ...credentials,
        email: credentials.email.trim(),
      });
      if (!result.success) {
        setLoginError(result.error || "Invalid credentials");

        setCredentials((prev) => ({
          ...prev,
          password: ""
        }));
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
   <AuthGridBackground>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      >
        <AppScreen style={styles.container}>
            <View style={styles.card}>
              <View style={styles.topRow}>
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => router.push('/welcome')}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  hitSlop={8}
                >
                  <Feather name="arrow-left" size={16} color={themes.textSecondary} />
                  <AppText style={styles.backLinkText}>Back</AppText>
                </TouchableOpacity>
                <Image
                  source={Images.logo.sctMark}
                  style={styles.brandMark}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel="SCT logo"
                />
              </View>
              <View style={styles.loginScreenContentContainer}>
                <AppText style={styles.heading} accessibilityRole="header">
                  Sign in
                </AppText>
                <AppText variant="body" style={styles.subtitle}>
                  Your schedule, progress and program updates, in one place.
                </AppText>
                <View style={styles.form}>
                  <AppInput
                    label="Email"
                    placeholder="you@example.com"
                    style={styles.textInputBox}
                    value={credentials.email}
                    onChangeText={(text) => handleChange("email", text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                  <AppInput
                    label="Password"
                    placeholder="Enter your password"
                    style={styles.textInputBox}
                    secureTextEntry={true}
                    value={credentials.password}
                    onChangeText={(text) => handleChange("password", text)}
                  />
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => router.push('/forgot-password')}
                    hitSlop={8}
                  >
                    <AppText style={styles.forgotPasswordText}>Forgot password?</AppText>
                  </TouchableOpacity>
                  {loginError ? (
                    <AppText style={styles.loginErrorText}>{loginError}</AppText>
                  ) : null}
                  <AppButton
                    style={styles.logInButton as any}
                    fullWidth
                    size="lg"
                    label="Sign in"
                    isLoading={isLoading}
                    onPress={handleLogin}
                  />
                </View>
                <View style={styles.horizontalLine} />
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <AppText style={styles.registerPrompt}>
                    Don&apos;t have an account?{" "}
                    <AppText style={styles.registerLink}>Sign up</AppText>
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
        </AppScreen>
      </ScrollView>
    </KeyboardAvoidingView>
   </AuthGridBackground>
  );
}
