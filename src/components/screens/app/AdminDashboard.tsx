import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
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
import { smsInviteService } from "@/src/services/smsInviteService";
import { courseService } from "@/src/services/courseService";
import { adminDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/AdminDashboardStyles/adminDashboardStyles";
import { Company, InviteCode } from "@/src/types/company.types";
import { CourseSummary } from "@/src/types/course.types";
import { SmsInviteListItem } from "@/src/types/smsOnboarding.types";
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

  // SMS Invite state
  const [smsPhone, setSmsPhone] = useState("");
  const [smsRole, setSmsRole] = useState<string>("STUDENT");
  const [smsCourseId, setSmsCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [smsInvites, setSmsInvites] = useState<SmsInviteListItem[]>([]);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsMessage, setSmsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      const [companyResponse, coursesResponse, smsResponse] = await Promise.all([
        companyService.getCompany(companyId),
        courseService.getCourseForSelection(),
        smsInviteService.listInvites(companyId),
      ]);

      if (companyResponse.success && companyResponse.data) {
        setCompany(companyResponse.data);
        fetchInviteCodes(companyResponse.data.id);
      } else {
        Alert.alert("Error", "Failed to load company data");
      }
      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data);
      }
      if (smsResponse.success && smsResponse.data) {
        setSmsInvites(smsResponse.data);
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

  const handleSendSmsInvite = async () => {
    if (!company || !smsPhone.trim()) return;

    setIsSendingSms(true);
    setSmsMessage(null);

    try {
      const result = await smsInviteService.createInvite(company.id, {
        phone_number: smsPhone.trim(),
        role: smsRole,
        course_id: smsRole === "STUDENT" ? smsCourseId : null,
      });

      if (result.success && result.data) {
        setSmsMessage({ type: "success", text: `Invite sent to ${smsPhone.trim()}` });
        setSmsPhone("");
        const refreshed = await smsInviteService.listInvites(company.id);
        if (refreshed.success && refreshed.data) {
          setSmsInvites(refreshed.data);
        }
      } else {
        setSmsMessage({ type: "error", text: result.error || "Failed to send invite" });
      }
    } catch {
      setSmsMessage({ type: "error", text: "An error occurred while sending the invite" });
    } finally {
      setIsSendingSms(false);
    }
  };

  const SMS_ROLES = [
    { label: "Student", value: "STUDENT" },
    { label: "Instructor", value: "INSTRUCTOR" },
    { label: "Admin", value: "ADMIN" },
  ];

  const getQRCodeUrl = (text: string, size: number = 200) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
            {/* SMS Invite Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SMS Invites</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Phone number (e.g. +15551234567)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={smsPhone}
                onChangeText={(text) => {
                  setSmsPhone(text);
                  setSmsMessage(null);
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 }}>
                {SMS_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setSmsRole(r.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: themes.vegasGold,
                      backgroundColor: smsRole === r.value ? themes.vegasGold : "transparent",
                    }}
                  >
                    <Text style={{
                      fontFamily: "Chakra-Bold",
                      fontSize: 14,
                      color: smsRole === r.value ? themes.black : themes.vegasGold,
                    }}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {smsRole === "STUDENT" && courses.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setSmsCourseId(null)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: themes.vegasGold,
                          backgroundColor: smsCourseId === null ? themes.vegasGold : "transparent",
                        }}
                      >
                        <Text style={{
                          fontFamily: "Chakra-Regular",
                          fontSize: 13,
                          color: smsCourseId === null ? themes.black : themes.white,
                        }}>
                          No Course
                        </Text>
                      </TouchableOpacity>
                      {courses.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setSmsCourseId(c.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: themes.vegasGold,
                            backgroundColor: smsCourseId === c.id ? themes.vegasGold : "transparent",
                          }}
                        >
                          <Text style={{
                            fontFamily: "Chakra-Regular",
                            fontSize: 13,
                            color: smsCourseId === c.id ? themes.black : themes.white,
                          }}>
                            {c.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {smsMessage && (
                <Text style={{
                  marginTop: 8,
                  fontFamily: "Chakra-Regular",
                  fontSize: 14,
                  textAlign: "center",
                  color: smsMessage.type === "success" ? "#4CAF50" : "#FF4444",
                }}>
                  {smsMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { opacity: isSendingSms || !smsPhone.trim() ? 0.5 : 1 }]}
                onPress={handleSendSmsInvite}
                disabled={isSendingSms || !smsPhone.trim()}
              >
                {isSendingSms ? (
                  <ActivityIndicator size="small" color={themes.black} />
                ) : (
                  <Text style={styles.buttonText}>Send SMS Invite</Text>
                )}
              </TouchableOpacity>

              {smsInvites.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{
                    fontFamily: "Chakra-Bold",
                    fontSize: 16,
                    color: themes.vegasGold,
                    marginBottom: 8,
                  }}>
                    Recent Invites
                  </Text>
                  {smsInvites.slice(0, 10).map((inv) => (
                    <View key={inv.id} style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(197,179,88,0.2)",
                    }}>
                      <Text style={{ fontFamily: "Chakra-Regular", fontSize: 14, color: themes.white }}>
                        {inv.target_phone_number}
                      </Text>
                      <Text style={{ fontFamily: "Chakra-Regular", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        {inv.target_role} · {inv.invite_status}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
            </View>
          </ScrollView>
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
