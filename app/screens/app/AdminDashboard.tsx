import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { adminDashboardStyles } from "@/src/styles/adminDashboard";
import { companyService } from "@/src/services/companyService";
import { useAuth } from "@/src/context/AuthContext";
import { Company, InviteCode } from "@/src/types/company.types";
import InviteCodeList from "@/src/components/admin/InviteCodeList";
import InviteCodeForm from "@/src/components/admin/InviteCodeForm";
export default function AdminDashboard() {
  const { user } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const handleCreateInviteCode = async () => {
    if (!company) {
      Alert.alert("Error", "Company information is not available");
      return;
    }

    setIsSubmittingCode(true);

    try {
      const response = await companyService.createInviteCode({
        company_id: company.id,
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

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  return (
    <View style={adminDashboardStyles.container}>
      <BackgroundGradient>
        <SafeAreaView style={adminDashboardStyles.safeArea}>
          <View style={adminDashboardStyles.content}>
            {company && (
                <Text style={adminDashboardStyles.pageTitle}>{company.name} Dashboard</Text>
            )}
            {/* Debugging indicator */}
            {isLoading && (
              <Text style={{color: 'white', textAlign: 'center'}}>
                Loading company data...
              </Text>
            )}
            <View style={adminDashboardStyles.section}>
              <Text style={adminDashboardStyles.sectionTitle}>
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
                style={adminDashboardStyles.actionButton}
                onPress={() => setInviteCodeModalVisible(true)}
                disabled={!company}
              >
                <Text style={adminDashboardStyles.buttonText}>
                  Create Invite Code
                </Text>
              </TouchableOpacity>
            </View>
            <View style={adminDashboardStyles.userManagementSection}>
              <Text style={adminDashboardStyles.sectionTitle}>
                User Management
              </Text>
              <TouchableOpacity
                style={adminDashboardStyles.userActionButton}
                onPress={() => {
                  Alert.alert(
                    "Coming Soon",
                    "User management feature is coming soon."
                  );
                }}
              >
                <Text style={adminDashboardStyles.buttonText}>
                  Manage Users
                </Text>
              </TouchableOpacity>
            </View>
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