import React from "react";
import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/auth.types";
import { themes } from "@/src/context/themes";

export default function DashboardRouter() {
  const { user, isLoading } = useAuth();

  console.log(
    `Dashboard Router - User: ${user?.email}, Role: ${user?.role}, Loading: ${isLoading}`
  );

  if (isLoading) {
    console.log("Dashboard Router: Loading user data...");
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
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log(
      "Dashboard Router: No authenticated user, redirecting to login"
    );
    return <Redirect href="/login" />;
  }

  if (!user.role) {
    console.error("Dashboard Router: User has no role assigned");
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themes.black,
        }}
      >
        <Text
          style={{
            color: themes.white,
            fontSize: 18,
            fontFamily: "Chakra-Regular",
            textAlign: "center",
          }}
        >
          Account setup incomplete.{"\n"}Please contact support.
        </Text>
      </View>
    );
  }

  if (user.role === UserRole.MASTER_ADMIN) {
    console.log(
      "Dashboard Router: Routing master admin to system dashboard"
    );
    return <Redirect href="/system/dashboard" />;
  } else if (user.role === UserRole.ADMIN) {
    console.log(
      "Dashboard Router: Routing company admin to management dashboard"
    );
    return <Redirect href="/company/management/dashboard" />;
  } else if (user.role === UserRole.INSTRUCTOR) {
    console.log(
      "Dashboard Router: Routing instructor to learning dashboard"
    );
    return <Redirect href="/learning/dashboard" />;
  } else if (user.role === UserRole.STUDENT) {
    console.log("Dashboard Router: Routing student to learning dashboard");
    return <Redirect href="/learning/dashboard" />;
  } else {
    console.error(`Dashboard Router: Unknown role: ${user.role}`);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themes.black,
        }}
      >
        <Text
          style={{
            color: themes.white,
            fontSize: 18,
            fontFamily: "Chakra-Regular",
            textAlign: "center",
          }}
        >
          Invalid user role.{"\n"}Please contact support.
        </Text>
      </View>
    );
  }
}
