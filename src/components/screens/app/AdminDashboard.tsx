import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import InviteCodeList from "@/src/components/admin/InviteCodeList";
import InviteCodeForm from "@/src/components/admin/InviteCodeForm";

import { adminDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/AdminDashboardStyles/adminDashboardStyles";
import { companyService } from "@/src/services/companyService";
import { useAuth } from "@/src/context/AuthContext";
import { Company, InviteCode } from "@/src/types/company.types";
import { UserRole } from "@/src/types/enums";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [inviteCodeModalVisible, setInviteCodeModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (user?.company_id) {
      fetchCompanyData(Number(user.company_id));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCompanyData = async (companyId: number) => {
    setIsLoading(true);
    try {
      const companyResponse = await companyService.getCompany(companyId);

      if (companyResponse.success && companyResponse.data) {
        setCompany(companyResponse.data);
        fetchInviteCodes(companyResponse.data.id);
      } else {
        Alert.alert("Error", "Failed to load company data");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviteCodes = async (companyId: number) => {
    setIsLoadingCodes(true);
    try {
      const response = await companyService.getInviteCodes(companyId);

      if (response.success && response.data) {
        setInviteCodes(response.data);
      } else {
        console.error("Failed to fetch invite codes");
      }
    } catch (error) {
      console.error("Error fetching invite codes:", error);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleCreateInviteCode = async (selectedRole: UserRole) => {
    if (!company) {
      Alert.alert("Error", "Company information is not available");
      return;
    }

    setIsSubmittingCode(true);

    try {
      const response = await companyService.createInviteCode({
        company_id: company.id,
        role: selectedRole
      });

      if (response.success && response.data) {
        setInviteCodes([response.data, ...inviteCodes]);
        setInviteCodeModalVisible(false);

        Alert.alert("Invite Code Created", `New code: ${response.data.code}`, [
          {
            text: "Copy Code",
            onPress: () =>
              response.data?.code && copyToClipboard(response.data.code),
          },
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to create invite code");
      }
    } catch (error) {
      console.error("Error creating invite code:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {company && (
              <Text style={styles.pageTitle}>
                {company.name} Dashboard
              </Text>
            )}
            {isLoading && (
              <Text style={{ color: "white", textAlign: "center" }}>
                Loading company data...
              </Text>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Invite Codes
              </Text>
              <InviteCodeList
                inviteCodes={inviteCodes}
                selectedCompany={company}
                isLoading={isLoadingCodes}
                onCopyCode={copyToClipboard}
                showTitle={false}
              />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setInviteCodeModalVisible(true)}
                disabled={!company}
              >
                <Text style={styles.buttonText}>
                  Create Invite Code
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {company && (
          <InviteCodeForm
            visible={inviteCodeModalVisible}
            company={company}
            isSubmitting={isSubmittingCode}
            onClose={() => setInviteCodeModalVisible(false)}
            onSubmit={handleCreateInviteCode}
          />
        )}
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
