import React, { useEffect, useState } from "react";
import { masterAdminDashboardStyles } from "@/src/styles/masterDashboardScreen";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { companyService } from "@/src/services/companyService";
import { useAuth } from "@/src/context/AuthContext";
import {
  Company,
  InviteCode,
  CreateCompanyRequest,
} from "@/src/types/company.types";

import CompanyList from "@/src/components/admin/CompanyList";
import InviteCodeList from "@/src/components/admin/InviteCodeList";
import CompanyForm from "@/src/components/admin/CompanyForm";
import InviteCodeForm from "@/src/components/admin/InviteCodeForm";
import AdminStats from "@/src/components/admin/AdminStats";

export default function MasterAdminDashboard() {
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [isSubmittingCompany, setIsSubmittingCompany] =
    useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);

  const [companyModalVisible, setCompanyModalVisible] =
    useState<boolean>(false);
  const [inviteCodeModalVisible, setInviteCodeModalVisible] =
    useState<boolean>(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvites: 0,
    sessions: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchInviteCodes(selectedCompany.id);
    }
  }, [selectedCompany]);

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

  const fetchInviteCodes = async (companyId: number) => {
    setIsLoadingCodes(true);

    try {
      const response = await companyService.getInviteCodes(
        companyId.toString()
      );

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

  const handleSeleectCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleCreateCompany = async (data: CreateCompanyRequest) => {
    setIsSubmittingCompany(true);

    try {
      const response = await companyService.createCompany(data);

      if (response.success && response.data) {
        const updatedCompanies = [...companies, response.data];
        setCompanies(updatedCompanies);

        setSelectedCompany(response.data);

        setCompanyModalVisible(false);

        Alert.alert("Success", "Company created successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to create company");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      Alert.alert("Error", "An unexpected error occurred, Please try again");
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

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  return (
    <View style={masterAdminDashboardStyles.container}>
      <BackgroundGradient>
        <SafeAreaView style={masterAdminDashboardStyles.safeArea}>
          <View style={masterAdminDashboardStyles.contentContainer}>
            <Text style={masterAdminDashboardStyles.pageTitle}>
              Master Admin
            </Text>
            <View style={masterAdminDashboardStyles.columnsContainer}>
              <View style={masterAdminDashboardStyles.leftColumn}>
                <CompanyList
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelectCompany={handleSeleectCompany}
                  isLoading={isLoading}
                />
              </View>

              <View style={masterAdminDashboardStyles.rightColumn}>
                <InviteCodeList
                  inviteCodes={inviteCodes}
                  selectedCompany={selectedCompany}
                  isLoading={isLoadingCodes}
                  onCopyCode={copyToClipboard}
                />
              </View>
            </View>
            <View style={masterAdminDashboardStyles.buttonContainer}>
              <TouchableOpacity
                style={masterAdminDashboardStyles.actionButton}
                onPress={() => setCompanyModalVisible(true)}
              >
                <Text style={masterAdminDashboardStyles.buttonText}>
                  Create Company
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  masterAdminDashboardStyles.actionButton,
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
                <Text style={masterAdminDashboardStyles.buttonText}>
                  Create Invite Code
                </Text>
              </TouchableOpacity>
            </View>
            <AdminStats stats={stats} selectedCompany={selectedCompany} />
          </View>
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
