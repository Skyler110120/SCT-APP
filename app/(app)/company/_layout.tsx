import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/auth.types";
import { themes } from "@/src/context/themes";

export default function CompanyLayout() {
  const { user, isLoading } = useAuth();
  console.log("🏢 Company Layout Guard - Company Features Access for:", user?.email);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: themes.black 
      }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text style={{
          marginTop: 16,
          color: themes.white,
          fontSize: 16,
          fontFamily: "Chakra-Regular"
        }}>
          Checking company access...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log("Company Layout: No user, redirecting to login");
    return <Redirect href="/login" />;
  }
  const hasCompanyAccess = [
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT
  ].includes(user.role);

  if (!hasCompanyAccess) {
    console.log(`Company Layout: Access denied for role ${user.role}, redirecting to dashboard`);
    return <Redirect href="/dashboard" />;
  }

  console.log(`✅ Company Layout: Company access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}