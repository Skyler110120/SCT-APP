import { useAuth } from "@/src/context/AuthContext";
import { useEffect } from "react";
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
import { AuthBrandLockup } from "@/src/components/auth/AuthBrandLockup";

export default function LoginScreen() {

  useEffect(() => {
  console.log("LoginScreen mounted");
  return () => console.log("LoginScreen unmounted");
}, []);

  const router = useRouter();
  const { login, state } = useAuth();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(credentials);
      if (!success) {
        Alert.alert("Login Failed", state.error || "Invalid credentials");

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
              <View style={styles.backButtonContainer}>
                <TouchableOpacity onPress={() => router.push('/welcome')}>
                  <Image source={Images.buttons.backButton} />
                </TouchableOpacity>
              </View>
              <View style={styles.loginScreenContentContainer}>
                <View style={styles.logoWrap}>
                  <AuthBrandLockup compact />
                </View>
                <AppText variant="title" style={styles.heading}>
                  Sign in to your training hub
                </AppText>
                <AppText variant="body" style={styles.subtitle}>
                  Access your schedule, progress, and program updates in one secure place.
                </AppText>
                <View style={styles.securityBadge}>
                  <AppText variant="caption" style={styles.securityText}>
                    Secure encrypted login
                  </AppText>
                </View>
                <View style={styles.form}>
                  <AppInput
                    label="Email"
                    placeholder="Email"
                    style={styles.textInputBox}
                    value={credentials.email}
                    onChangeText={(text) => handleChange("email", text)}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                  <AppInput
                    label="Password"
                    placeholder="Password"
                    style={styles.textInputBox}
                    secureTextEntry={true}
                    value={credentials.password}
                    onChangeText={(text) => handleChange("password", text)}
                  />
                  <AppButton
                    style={styles.logInButton as any}
                    fullWidth
                    label="Sign in"
                    isLoading={isLoading}
                    onPress={handleLogin}
                  />
                </View>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <AppText style={styles.forgotPasswordText}>
                    Forgot Password?
                  </AppText>
                </TouchableOpacity>
                <View style={styles.orContainer}>
                  <View style={styles.horizontalLine} />
                  <AppText style={styles.orText}>OR</AppText>
                  <View style={styles.horizontalLine} />
                </View>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <AppText style={styles.registerPrompt}>
                    Don't have an account?{" "}
                    <AppText style={styles.registerLink}>Create one</AppText>
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
