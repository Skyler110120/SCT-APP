import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { dashboardStyles } from "@/src/styles/dashboard";
import BottomNavBar from "@/src/components/NavBar";
import { OnboardingModal } from "@/src/components/OnboardingModal";
import { onboardingService } from "@/src/services/onboardingService";

export default function InstructorDashboard() {
  const router = useRouter();
  const { state, logout, updateUser, needsOnboarding } = useAuth();
  const user = state.user;
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboardingModal(true);
    } else {
      setShowOnboardingModal(false);
    }
  }, [needsOnboarding]);

  const handleLogout = async () => {
    await logout();
    router.replace("/screens/auth/Login");
  };

  const handleSubmitInviteCode = async (code: string) => {
    try {
      const companyData = await onboardingService.completeOnboarding(code);

      if (!companyData || !user) {
        throw new Error("Failed to validate invite code");
      }

      const updatedUser = await onboardingService.updateUserAfterOnboarding(
        user.id,
        companyData.company_id
      );

      if (updatedUser) {
        updateUser({
          company_id: companyData.company_id,
        });
      } else {
        throw new Error("Failed to join company");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={dashboardStyles.container}>
      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.title}>Stone Cold Tactical</Text>
      </View>

      <View style={dashboardStyles.userInfoSection}>
        <Text style={dashboardStyles.welcomeText}>
          Welcome, {user?.first_name} {user?.last_name}!
        </Text>
        <Text style={dashboardStyles.emailText}>{user?.email}</Text>
      </View>

      {!needsOnboarding ? (
        <>
          <View style={dashboardStyles.contentSection}>
            <Text style={dashboardStyles.contentText}>
              You've successfully logged in to your account.
            </Text>
          </View>

          <TouchableOpacity
            style={dashboardStyles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={dashboardStyles.logoutButtonText}>LOG OUT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dashboardStyles.logoutButton}>
            <Text
              style={dashboardStyles.logoutButtonText}
              onPress={() => router.push("/screens/app/InstructorCalendar")}
            >
              Go to Calendar
            </Text>
          </TouchableOpacity>
          <BottomNavBar />
        </>
      ) : (
        <View style={dashboardStyles.contentSection}>
          <Text style={dashboardStyles.contentText}>
            Please enter your company invite code to access all features.
          </Text>

          <TouchableOpacity
            style={dashboardStyles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={dashboardStyles.logoutButtonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      )}

      <OnboardingModal
        isVisible={showOnboardingModal}
        onSubmitCode={handleSubmitInviteCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.vegasGold || "#000033",
    flexDirection: "column",
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: themes.vegasGold || "#FFD700",
    fontFamily: "Chakra-Bold",
  },
  userInfoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    fontFamily: "Chakra-Bold",
  },
  emailText: {
    fontSize: 16,
    color: "#cccccc",
    fontFamily: "Chakra-Regular",
  },
  contentSection: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: "white",
    lineHeight: 24,
    fontFamily: "Chakra-Regular",
  },
  logoutButton: {
    backgroundColor: themes.black || "#FFD700",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: themes.vegasGold || "#000033",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Chakra-Bold",
  },
});
