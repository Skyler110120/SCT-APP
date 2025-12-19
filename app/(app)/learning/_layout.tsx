import React from "react";
import { Slot, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";

export default function LearningLayout() {
  const { user, isLoading } = useAuth();
  console.log("📚 Learning Layout Guard - Education Features Access for:", user?.email);

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
          Checking learning access...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log("Learning Layout: No user, redirecting to login");
    return <Redirect href="/login" />;
  }

  const hasLearningAccess = [
    UserRole.INSTRUCTOR,
    UserRole.STUDENT
  ].includes(user.role);

  if (!hasLearningAccess) {
    console.log(`Learning Layout: Access denied for role ${user.role}, redirecting to company calendar`);
    return <Redirect href="/company/calendar" />;
  }

  console.log(`✅ Learning Layout: Learning access granted for ${user.role}`);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}