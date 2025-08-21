import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/auth.types";
import { themes } from "@/src/context/themes";

export default function SystemLayout() {
  const { user, isLoading } = useAuth();

  console.log(
    "System Layout Guard - Platform Management Access for:",
    user?.email
  );

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
          Checking system permissions...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log("System Layout: No user, redirection to login");
    return <Redirect href="/login" />;
  }

  const isMasterAdmin = user.role === UserRole.MASTER_ADMIN;

  if (!isMasterAdmin) {
    console.log(
      `System Layout: Access denied for role ${user.role}, redirecting to dashboard`
    );
    return <Redirect href="/dashboard" />;
  }

  console.log(`System Layout: Platform access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
