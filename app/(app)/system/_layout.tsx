import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";
import { logger } from "@/src/utils/logger";

export default function SystemLayout() {
  const { user, isLoading } = useAuth();

  logger.debug("System layout guard check");

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
    logger.debug("System layout: no user, redirecting to login");
    return <Redirect href="/login" />;
  }

  const isMasterAdmin = user.role === UserRole.MASTER_ADMIN;

  if (!isMasterAdmin) {
    logger.debug(`System layout: access denied for role ${user.role}`);
    return <Redirect href="/dashboard" />;
  }

  logger.debug(`System layout: platform access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
