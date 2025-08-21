import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <BackgroundGradient>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{ fontSize: 24, fontWeight: "bold", color: themes.white }}
          >
            Dashboard
          </Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/login");
            }}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: themes.vegasGold,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 18, color: themes.black }}>
              Go to Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push("/register");
            }}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: themes.black,
              borderWidth: 1,
              borderRadius: 20,
              borderColor: themes.vegasGold,
            }}
          >
            <Text style={{ fontSize: 18, color: themes.white }}>
              Go to Register
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundGradient>
  );
}
