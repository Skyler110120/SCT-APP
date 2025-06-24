import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { RegisterData } from "@/src/types/auth.types";
import { registerScreenStyles } from "@/src/styles/registerScreen";
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

// RegisterScreen component
// This component renders a registration screen with a background gradient, logo,
// input fields for first name, last name, email, and password,
// a sign-up button, and an option to sign in with Google.
export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        Alert.alert(
          "Registration Successful",
          "Your account has been created. Please log in.",
          [
            {
              text: "OK",
              onPress: () => router.push("/screens/Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Registration Failed",
          result.error || "Registration failed"
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occured");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={registerScreenStyles.container}>
      <BackgroundGradient>
        <SafeAreaView style={registerScreenStyles.container}>
          <View style={registerScreenStyles.backButtonContainer}>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Image source={Images.buttons.backButton} />
            </TouchableOpacity>
          </View>
          <View style={registerScreenStyles.registerScreenContentContainer}>
            <Image
              source={Images.logo.sctLogo}
              style={registerScreenStyles.image}
            />
            <View style={registerScreenStyles.nameInputBoxContainer}>
              <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="First Name"
                placeholderTextColor={themes.vegasGold}
                style={registerScreenStyles.nameInputBox}
                value={formData.first_name}
                onChangeText={(text) => handleChange("first_name", text)}
              />
              <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="Last Name"
                placeholderTextColor={themes.vegasGold}
                style={registerScreenStyles.nameInputBox}
                value={formData.last_name}
                onChangeText={(text) => handleChange("last_name", text)}
              />
            </View>
            <TextInput
              multiline={false}
              scrollEnabled={false}
              placeholder="Email"
              placeholderTextColor={themes.vegasGold}
              style={registerScreenStyles.textInputBox}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              multiline={false}
              scrollEnabled={false}
              placeholder="Password"
              placeholderTextColor={themes.vegasGold}
              style={registerScreenStyles.textInputBox}
              secureTextEntry={true}
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
            />
            <TouchableOpacity
              style={registerScreenStyles.signUpButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={registerScreenStyles.signUpButtonText}>
                  SIGN UP
                </Text>
              )}
            </TouchableOpacity>
            <View style={registerScreenStyles.orContainer}>
              <View style={registerScreenStyles.horizontalLine} />
              <Text style={registerScreenStyles.orText}>OR</Text>
              <View style={registerScreenStyles.horizontalLine} />
            </View>
            <TouchableOpacity>
              <Image
                source={Images.buttons.signInWithGoogle}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
