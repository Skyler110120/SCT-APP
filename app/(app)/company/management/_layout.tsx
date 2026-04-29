import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";
import { logger } from "@/src/utils/logger";

export default function CompanyManagementLayout() {
  const { user, isLoading } = useAuth();
  logger.debug("Company management layout guard check");

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
    logger.debug("Management layout: no user, redirecting to login");
    return <Redirect href="/login" />;
  }

  const isCompanyAdmin = user.role === UserRole.ADMIN;
  const instructorCanManageUsers =
    user.role === UserRole.INSTRUCTOR &&
    !!(user.can_manage_others_permissions || user.can_set_others_session_capacity);
  const hasManagementAccess = isCompanyAdmin || instructorCanManageUsers;

  if (!hasManagementAccess) {
    logger.debug(`Management layout: access denied for role ${user.role}`);
    return <Redirect href="/company/calendar" />;
  }

  logger.debug(`Management layout: admin access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}