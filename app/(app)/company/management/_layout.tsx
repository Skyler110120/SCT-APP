import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/auth.types";
import { themes } from "@/src/context/themes";

export default function CompanyManagementLayout() {
  const { user, isLoading } = useAuth();
  console.log("🔧 Company Management Layout - Admin Access Check for:", user?.email);

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
          Checking management permissions...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log("Management Layout: No user, redirecting to login");
    return <Redirect href="/login" />;
  }

  const isCompanyAdmin = user.role === UserRole.ADMIN;

  if (!isCompanyAdmin) {
    console.log(`Management Layout: Access denied for role ${user.role}, redirecting to company calendar`);
    return <Redirect href="/company/calendar" />;
  }

  console.log(`Management Layout: Admin access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}