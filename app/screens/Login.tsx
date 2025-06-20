import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";
import { loginScreenStyles } from "@/src/styles/loginScreen";
import { useRouter } from "expo-router";
import { Image, Text, TextInput, View, TouchableOpacity } from "react-native";

// LoginScreen component
// This component renders a login screen with a background gradient, logo, 
// text inputs for email and password, a login button, a forgot password link, 
// and an option to sign in with Google.
export default function LoginScreen() {
  const router = useRouter();
  return (
    <View style={loginScreenStyles.container}>
      <BackgroundGradient>
        <View style={loginScreenStyles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={require("@/src/assets/images/Backbutton.png")} />
          </TouchableOpacity>
        </View>
        <View style={loginScreenStyles.loginScreenContentContainer}>
          <Image
            source={require("@/src/assets/images/SCTLogo.jpg")}
            style={loginScreenStyles.image}
          />
          <TextInput
            multiline={false}
            scrollEnabled={false}
            placeholder="Email"
            placeholderTextColor={themes.vegasGold}
            style={loginScreenStyles.textInputBox}
          />
          <TextInput
            multiline={false}
            scrollEnabled={false}
            placeholder="Password"
            placeholderTextColor={themes.vegasGold}
            style={loginScreenStyles.textInputBox}
            secureTextEntry={true}
          />
          <TouchableOpacity style={loginScreenStyles.logInButton}>
            <Text style={loginScreenStyles.logInButtonText}>LOG IN</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={loginScreenStyles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <View style={loginScreenStyles.orContainer}>
            <View style={loginScreenStyles.horizontalLine}/>
            <Text style={loginScreenStyles.orText}>OR</Text>
            <View style={loginScreenStyles.horizontalLine}/>
          </View>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={require("@/src/assets/images/SignInWithGoogle.png")} />
          </TouchableOpacity>
        </View>
      </BackgroundGradient>
    </View>
  );
}
