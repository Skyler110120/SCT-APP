import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";
import { logger } from "@/src/utils/logger";

export default function CompanyLayout() {
  const { user, isLoading } = useAuth();
  logger.debug("Company layout guard check");

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
    logger.debug("Company layout: no user, redirecting to login");
    return <Redirect href="/login" />;
  }
  const hasCompanyAccess = [
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT
  ].includes(user.role);

  if (!hasCompanyAccess) {
    logger.debug(`Company layout: access denied for role ${user.role}`);
    return <Redirect href="/dashboard" />;
  }

  logger.debug(`Company layout: access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}