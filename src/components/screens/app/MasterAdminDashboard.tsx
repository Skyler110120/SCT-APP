import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { companyService } from "@/src/services/companyService";
import { onboardingInviteService } from "@/src/services/onboardingInviteService";
import { userService } from "@/src/services/userService";
import { OnboardingInviteListItem } from "@/src/types/onboardingInvite.types";
import { themes } from "@/src/context/themes";
import { masterAdminDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/MasterAdminDashboardStyles/masterDashboardScreenStyles";
import { User } from "@/src/types/auth.types";
import {
  Company,
  CreateCompanyRequest,
  InviteCode,
} from "@/src/types/company.types";
import { UserRole } from "@/src/types/enums";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminStats from "@/src/components/admin/AdminStats";
import CompanyForm from "@/src/components/admin/CompanyForm";
import CompanyList from "@/src/components/admin/CompanyList";
import InviteCodeForm from "@/src/components/InviteCodeForm";
import InviteCodeList from "@/src/components/InviteCodeList";

export default function MasterAdminDashboard() {
  const { logout } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [users, setUsers] = useState<User[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [isSubmittingCompany, setIsSubmittingCompany] =
    useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [companyModalVisible, setCompanyModalVisible] =
    useState<boolean>(false);
  const [inviteCodeModalVisible, setInviteCodeModalVisible] =
    useState<boolean>(false);

  const [emailInvites, setEmailInvites] = useState<OnboardingInviteListItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvites: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    setInviteEmail("");
    setInviteError(null);
    setInviteSuccess(null);
    if (selectedCompany) {
      fetchInviteCodes(selectedCompany.id);
      fetchUsers(selectedCompany.id)
      loadEmailInvites(selectedCompany.id);
    } else {
      setEmailInvites([]);
    }
  }, [selectedCompany]);

  const loadEmailInvites = async (companyId: number) => {
    const response = await onboardingInviteService.listInvites(companyId);
    setEmailInvites(response.success && response.data ? response.data : []);
  };

  const handleSendEmailInvite = async () => {
    const email = inviteEmail.trim();
    if (!selectedCompany || !email) return;
    setIsSendingInvite(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const result = await onboardingInviteService.createInvite(selectedCompany.id, {
        email,
        role: UserRole.ADMIN,
        course_id: null,
      });
      if (result.success && result.data) {
        setInviteSuccess(`Admin invite sent to ${email}`);
        setInviteEmail("");
        await loadEmailInvites(selectedCompany.id);
      } else {
        setInviteError(result.error || "Failed to send admin invite");
      }
    } catch {
      setInviteError("An error occurred while sending the admin invite");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const deleteSelectedCompany = async (company: Company) => {
    setIsDeletingCompany(true);
    try {
      const response = await companyService.deleteCompany(company.id);
      if (!response.success) {
        Alert.alert("Error", response.error || "Failed to delete company");
        return;
      }
      const remaining = companies.filter((c) => c.id !== company.id);
      setCompanies(remaining);
      setSelectedCompany(remaining.length > 0 ? remaining[0] : null);
      setInviteCodes([]);
      setEmailInvites([]);
      setUsers([]);
      setStats((prev) => ({ ...prev, totalUsers: 0, pendingInvites: 0 }));
    } catch (error) {
      console.error("Error deleting company:", error);
      Alert.alert("Error", "An error occurred while deleting the company");
    } finally {
      setIsDeletingCompany(false);
    }
  };

  const handleDeleteSelectedCompany = () => {
    if (!selectedCompany || isDeletingCompany) return;
    const company = selectedCompany;
    Alert.alert(
      "Delete Company",
      `Delete ${company.name}? This will also remove all users from the app while keeping records in the database.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSelectedCompany(company) },
      ]
    );
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await companyService.getAllCompanies();

      if (response.success && response.data) {
        setCompanies(response.data);

        if (response.data.length > 0 && !selectedCompany) {
          setSelectedCompany(response.data[0]);
        }

        setStats((prev) => ({
          ...prev,
          totalCompanies: response.data?.length || 0,
          activeCompanies:
            response.data?.filter((c) => c.is_active).length || 0,
        }));
      } else {
        setError(response.error || "Failed to fetch companies");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("An unexpected error occurrred, Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (companyId: number) => {
    setIsLoadingUsers(true);
    
    try {
      const response = await userService.getAllUsers(companyId);

      if (response.success && response.data) {
        setUsers(response.data);

        setStats((prev) => ({
          ...prev,
          totalUsers: response.data!.length,
        }));
      } else {
        console.error("Failed to fetch users:");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchInviteCodes = async (companyId: number) => {
    setIsLoadingCodes(true);

    try {
      const response = await companyService.getInviteCodes(companyId);

      if (response.success && response.data) {
        setInviteCodes(response.data);

        const activeInvites = response.data.filter(
          (code) => code.is_active
        ).length;

        setStats((prev) => ({
          ...prev,
          pendingInvites: activeInvites,
        }));
      } else {
        console.error("Failed to fetch invite codes:");
      }
    } catch (error) {
      console.error("Error fetching invite codes:", error);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleCreateCompany = async (data: CreateCompanyRequest) => {
    setIsSubmittingCompany(true);
    console.log("[MasterAdminDashboard] handleCreateCompany called with:", data);

    try {
      const response = await companyService.createCompany(data);
      console.log("[MasterAdminDashboard] createCompany response:", response);

      if (response.success && response.data) {
        const updatedCompanies = [...companies, response.data];
        setCompanies(updatedCompanies);

        setSelectedCompany(response.data);

        setCompanyModalVisible(false);

        Alert.alert("Success", "Company created successfully");
      } else {
        const errorMsg = response.error || "Failed to create company";
        console.error("[MasterAdminDashboard] Company creation failed:", errorMsg);
        Alert.alert("Error", errorMsg);
      }
    } catch (error: any) {
      console.error("[MasterAdminDashboard] Unexpected error creating company:", error);
      console.error("[MasterAdminDashboard] Error details:", {
        message: error?.message,
        status: error?.status,
        detail: error?.detail,
      });
      const errorMsg = error?.message || error?.detail || "An unexpected error occurred, Please try again";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!selectedCompany) {
      Alert.alert("Error", "Please select a company first");
      return;
    }

    setIsSubmittingCode(true);

    try {
      const response = await companyService.createInviteCode({
        company_id: selectedCompany.id,
        role: UserRole.ADMIN
      });

      if (response.success && response.data) {
        setInviteCodes([response.data, ...inviteCodes]);
        setInviteCodeModalVisible(false);

        setStats((prev) => ({
          ...prev,
          pendingInvites: prev.pendingInvites + 1,
        }));

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
      Alert.alert("Error", "An unexpected error occurred, Please try again");
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.pageTitle}>
                Master Admin
              </Text>
              <View style={styles.columnsContainer}>
                <View style={styles.leftColumn}>
                  <CompanyList
                    companies={companies}
                    selectedCompany={selectedCompany}
                    onSelectCompany={handleSelectCompany}
                    isLoading={isLoading}
                  />
                </View>

                <View style={styles.rightColumn}>
                  <InviteCodeList
                    inviteCodes={inviteCodes}
                    selectedCompany={selectedCompany}
                    isLoading={isLoadingCodes}
                    onCopyCode={copyToClipboard}
                  />
                </View>
              </View>
              <AdminStats stats={stats} selectedCompany={selectedCompany} />

              <View style={styles.selectedBanner}>
                <Text style={styles.selectedBannerLabel}>Selected company</Text>
                {selectedCompany ? (
                  <Text style={styles.selectedBannerTitle} numberOfLines={2}>
                    {selectedCompany.name}
                  </Text>
                ) : (
                  <Text style={styles.selectedBannerPlaceholder}>
                    Select a company above to create invite codes
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Text style={styles.contextActionsLabel}>
                  For selected company
                </Text>
                <View style={styles.contextButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      !selectedCompany && { opacity: 0.5 },
                    ]}
                    onPress={() => {
                      if (selectedCompany) {
                        setInviteCodeModalVisible(true);
                      } else {
                        Alert.alert("Error", "Please select a company first");
                      }
                    }}
                    disabled={!selectedCompany}
                  >
                    <Text style={styles.buttonText}>
                      Manual Invite Code
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedCompany && (
                  <View style={{ marginTop: 16, gap: 8 }}>
                    <Text style={styles.contextActionsLabel}>Email Invites (Primary)</Text>
                    <TextInput
                      value={inviteEmail}
                      onChangeText={(value) => {
                        setInviteEmail(value);
                        setInviteError(null);
                        setInviteSuccess(null);
                      }}
                      placeholder={`Invite admin to ${selectedCompany.name}`}
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        borderWidth: 1,
                        borderColor: themes.vegasGold,
                        borderRadius: 8,
                        color: themes.white,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                      }}
                    />
                    <Text style={{ color: themes.white, opacity: 0.7, fontSize: 12 }}>Role: Admin</Text>
                    {inviteError && <Text style={{ color: "#f87171" }}>{inviteError}</Text>}
                    {inviteSuccess && <Text style={{ color: "#4ade80" }}>{inviteSuccess}</Text>}
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        (isSendingInvite || !inviteEmail.trim()) && { opacity: 0.5 },
                      ]}
                      onPress={handleSendEmailInvite}
                      disabled={isSendingInvite || !inviteEmail.trim()}
                    >
                      {isSendingInvite ? (
                        <ActivityIndicator color={themes.white} />
                      ) : (
                        <Text style={styles.buttonText}>Send Admin Invite</Text>
                      )}
                    </TouchableOpacity>

                    {emailInvites.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.contextActionsLabel}>Recent Email Invites</Text>
                        {emailInvites.slice(0, 8).map((inv) => (
                          <View
                            key={inv.id}
                            style={{
                              paddingVertical: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: "rgba(197, 179, 88, 0.2)",
                            }}
                          >
                            <Text style={{ color: themes.white }}>{inv.target_email ?? "—"}</Text>
                            <Text style={{ color: themes.white, opacity: 0.7, fontSize: 12 }}>
                              {inv.target_role} · {inv.invite_status}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: "#f87171",
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: "center",
                        opacity: isDeletingCompany ? 0.5 : 1,
                      }}
                      onPress={handleDeleteSelectedCompany}
                      disabled={isDeletingCompany}
                      accessibilityLabel={`Delete ${selectedCompany.name}`}
                    >
                      <Text style={{ color: "#f87171", fontWeight: "600" }}>
                        {isDeletingCompany ? "Deleting company..." : "Delete Company"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.createCompanyButton}
                  onPress={() => setCompanyModalVisible(true)}
                >
                  <Text style={styles.createCompanyButtonText}>
                    Create Company
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={() => handleLogout()}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>

        <CompanyForm
          visible={companyModalVisible}
          isSubmitting={isSubmittingCompany}
          onClose={() => setCompanyModalVisible(false)}
          onSubmit={handleCreateCompany}
        />

        {selectedCompany && (
          <InviteCodeForm
            visible={inviteCodeModalVisible}
            company={selectedCompany}
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
