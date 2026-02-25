import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import InviteCodeForm from "@/src/components/InviteCodeForm";
import InviteCodeList from "@/src/components/InviteCodeList";
import BottomNavBar from "@/src/components/NavBar";

import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { companyService } from "@/src/services/companyService";
import { adminDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/AdminDashboardStyles/adminDashboardStyles";
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
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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

  const handleGenerateQR = async () => {
    if (!company) return;
    setIsGeneratingQR(true);
    try {
      const response = await companyService.getOnboardingLink(company.id);
      if (response.success && response.data) {
        setOnboardingLink(response.data.join_url);
      } else {
        Alert.alert("Error", response.error || "Failed to generate QR code");
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCopyLink = async () => {
    if (onboardingLink) {
      await Clipboard.setStringAsync(onboardingLink);
      Alert.alert("Copied", "Onboarding link copied to clipboard");
    }
  };

  const getQRCodeUrl = (text: string, size: number = 200) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;

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
            {/* QR Onboarding Section (TASK-ONB-003) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Onboarding QR</Text>
              {onboardingLink ? (
                <View style={{ alignItems: "center", paddingVertical: 12 }}>
                  <Image
                    source={{ uri: getQRCodeUrl(onboardingLink, 250) }}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 8,
                      backgroundColor: themes.white,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      fontFamily: "Chakra-Regular",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    Students scan this QR to sign up
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, { marginTop: 8 }]}
                    onPress={handleCopyLink}
                  >
                    <Text style={styles.buttonText}>Copy Link</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { marginTop: 4 }]}
                    onPress={handleGenerateQR}
                  >
                    <Text style={styles.buttonText}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleGenerateQR}
                  disabled={!company || isGeneratingQR}
                >
                  {isGeneratingQR ? (
                    <ActivityIndicator size="small" color={themes.black} />
                  ) : (
                    <Text style={styles.buttonText}>
                      Generate QR Code
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

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
