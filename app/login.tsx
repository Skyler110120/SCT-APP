import Login from "@/src/components/screens/auth/Login";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log(
    "Login Page Route - Authenticated:",
    isAuthenticated,
    "Loading:",
    isLoading
  );

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("Login Page: User authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themes.black,
        }}
      >
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text
          style={{
            marginTop: 16,
            color: themes.white,
            fontSize: 16,
            fontFamily: "Chakra-Regular",
          }}
        >
          Checking authentication...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themes.black,
        }}
      >
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text
          style={{
            marginTop: 16,
            color: themes.white,
            fontSize: 16,
            fontFamily: "Chakra-Regular",
          }}
        >
          Redirecting to dashboard...
        </Text>
      </View>
    );
  }
  console.log("Login Page Route");
  return <Login />;
}
