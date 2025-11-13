import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { LoginCredentials } from "@/src/types/auth.types";
import { loginScreenStyles } from "@/src/styles/loginScreen";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import Images from "@/src/assets/images";

// LoginScreen component
// This component renders a login screen with a background gradient, logo,
// text inputs for email and password, a login button, a forgot password link,
// and an option to sign in with Google.
export default function LoginScreen() {
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
      [field]: field === "email" ? value.toLowerCase() : value,
    }));
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(credentials);
      if (!success) {
        Alert.alert("Login Failed", state.error || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={loginScreenStyles.container}>
      <BackgroundGradient>
        <SafeAreaView style={loginScreenStyles.container}>
          <View style={loginScreenStyles.backButtonContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={Images.buttons.backButton} />
            </TouchableOpacity>
          </View>
          <View style={loginScreenStyles.loginScreenContentContainer}>
            <Image
              source={Images.logo.sctLogo}
              style={loginScreenStyles.image}
            />
            <TextInput
              multiline={false}
              scrollEnabled={false}
              placeholder="Email"
              placeholderTextColor={themes.vegasGold}
              style={loginScreenStyles.textInputBox}
              value={credentials.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              multiline={false}
              scrollEnabled={false}
              placeholder="Password"
              placeholderTextColor={themes.vegasGold}
              style={loginScreenStyles.textInputBox}
              secureTextEntry={true}
              value={credentials.password}
              onChangeText={(text) => handleChange("password", text)}
            />
            <TouchableOpacity
              style={loginScreenStyles.logInButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={themes.white} />
              ) : (
                <Text style={loginScreenStyles.logInButtonText}>LOG IN</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={loginScreenStyles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
            <View style={loginScreenStyles.orContainer}>
              <View style={loginScreenStyles.horizontalLine} />
              <Text style={loginScreenStyles.orText}>OR</Text>
              <View style={loginScreenStyles.horizontalLine} />
            </View>
            <TouchableOpacity>
              <Image source={Images.buttons.signInWithGoogle} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
