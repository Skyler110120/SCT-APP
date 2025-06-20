import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";
import { registerScreenStyles } from "@/src/styles/registerScreen";
import { useRouter } from "expo-router";
import { Image, Text, TextInput, View, TouchableOpacity } from "react-native";

// LoginScreen component
// This component renders a login screen with a background gradient, logo, 
// text inputs for email and password, a login button, a forgot password link, 
// and an option to sign in with Google.
export default function LoginScreen() {
  const router = useRouter();
  return (
    <View style={registerScreenStyles.container}>
      <BackgroundGradient>
        <View style={registerScreenStyles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={require("@/src/assets/images/Backbutton.png")} />
          </TouchableOpacity>
        </View>
        <View style={registerScreenStyles.registerScreenContentContainer}>
          <Image
            source={require("@/src/assets/images/SCTLogo.jpg")}
            style={registerScreenStyles.image}
          />
          <View style={registerScreenStyles.nameInputBoxContainer}>
            <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="First Name"
                placeholderTextColor={themes.vegasGold}
                style={registerScreenStyles.nameInputBox}
            />
            <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="Last Name"
                placeholderTextColor={themes.vegasGold}
                style={registerScreenStyles.nameInputBox}
            />
          </View>
          <TextInput
            multiline={false}
            scrollEnabled={false}
            placeholder="Email"
            placeholderTextColor={themes.vegasGold}
            style={registerScreenStyles.textInputBox}
          />
          <TextInput
            multiline={false}
            scrollEnabled={false}
            placeholder="Password"
            placeholderTextColor={themes.vegasGold}
            style={registerScreenStyles.textInputBox}
            secureTextEntry={true}
          />
          <TouchableOpacity style={registerScreenStyles.signUpButton}>
            <Text style={registerScreenStyles.signUpButtonText}>SIGN UP</Text>
          </TouchableOpacity>
          <View style={registerScreenStyles.orContainer}>
            <View style={registerScreenStyles.horizontalLine}/>
            <Text style={registerScreenStyles.orText}>OR</Text>
            <View style={registerScreenStyles.horizontalLine}/>
          </View>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image source={require("@/src/assets/images/SignInWithGoogle.png")} />
          </TouchableOpacity>
        </View>
      </BackgroundGradient>
    </View>
  );
}