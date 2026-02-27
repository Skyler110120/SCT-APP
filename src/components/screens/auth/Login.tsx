import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect } from "react";
import { themes } from "@/src/context/themes";
import { LoginCredentials } from "@/src/types/auth.types";
import { loginScreenStyles as styles } from "@/src/styles/LoginPageStyles/loginScreenStyles";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Images from "@/src/assets/images";

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
      Alert.alert("Error", "Please enter your email or phone number and password");
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
    
   <BackgroundGradient>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity onPress={() => router.push('/welcome')}>
                  <Image source={Images.buttons.backButton} />
                </TouchableOpacity>
              </View>
              <View style={styles.loginScreenContentContainer}>
                <Image
                  source={Images.logo.sctLogo}
                  style={styles.image}
                />
                <TextInput
                  multiline={false}
                  scrollEnabled={false}
                  placeholder="Email or phone number"
                  placeholderTextColor={themes.vegasGold}
                  style={styles.textInputBox}
                  value={credentials.email}
                  onChangeText={(text) => handleChange("email", text)}
                  autoCapitalize="none"
                  autoComplete="username"
                />
                <TextInput
                  multiline={false}
                  scrollEnabled={false}
                  placeholder="Password"
                  placeholderTextColor={themes.vegasGold}
                  style={styles.textInputBox}
                  secureTextEntry={true}
                  value={credentials.password}
                  onChangeText={(text) => handleChange("password", text)}
                />
                <TouchableOpacity
                  style={styles.logInButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={themes.white} />
                  ) : (
                    <Text style={styles.logInButtonText}>LOG IN</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
                <View style={styles.orContainer}>
                  <View style={styles.horizontalLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.horizontalLine} />
                </View>
                <TouchableOpacity>
                  <Image source={Images.buttons.signInWithGoogle} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
   </BackgroundGradient>
  );
}
