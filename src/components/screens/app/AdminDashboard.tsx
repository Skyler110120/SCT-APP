import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { onboardingInviteService } from "@/src/services/onboardingInviteService";
import { courseService } from "@/src/services/courseService";
import { paymentService } from "@/src/services/paymentService";
import { adminDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/AdminDashboardStyles/adminDashboardStyles";
import { Company, InviteCode } from "@/src/types/company.types";
import { CourseSummary } from "@/src/types/course.types";
import { OnboardingInviteListItem } from "@/src/types/onboardingInvite.types";
import { ConnectStatusResponse } from "@/src/types/payment.types";
import { UserRole } from "@/src/types/enums";
import { openStripeHostedUrl } from "@/src/utils/safeExternalUrl";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [inviteCodeModalVisible, setInviteCodeModalVisible] =
    useState<boolean>(false);

  // Email invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("STUDENT");
  const [inviteCourseId, setInviteCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [emailInvites, setEmailInvites] = useState<OnboardingInviteListItem[]>([]);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<ConnectStatusResponse | null>(
    null
  );
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [isSettingUpPayments, setIsSettingUpPayments] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [bookingLockHoursInput, setBookingLockHoursInput] = useState("24");
  const [isSavingBookingLock, setIsSavingBookingLock] = useState(false);
  const [bookingLockMessage, setBookingLockMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.company_id) {
      fetchCompanyData(Number(user.company_id));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCompanyData = async (companyId: number) => {
    setIsLoading(true);
    setIsLoadingPaymentStatus(true);
    try {
      const [companyResponse, coursesResponse, invitesResponse, paymentStatusResponse] = await Promise.all([
        companyService.getCompany(companyId),
        courseService.getCourseForSelection(),
        onboardingInviteService.listInvites(companyId),
        paymentService.getConnectStatus(companyId),
      ]);

      if (companyResponse.success && companyResponse.data) {
        setCompany(companyResponse.data);
        setBookingLockHoursInput(
          String(companyResponse.data.booking_lock_hours ?? 24)
        );
        fetchInviteCodes(companyResponse.data.id);
      } else {
        Alert.alert("Error", "Failed to load company data");
      }
      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data);
      }
      if (invitesResponse.success && invitesResponse.data) {
        setEmailInvites(invitesResponse.data);
      }
      if (paymentStatusResponse.payment_enabled !== undefined) {
        setPaymentStatus(paymentStatusResponse);
      } else {
        setPaymentStatus(null);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setIsLoadingPaymentStatus(false);
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

  const handleSendEmailInvite = async () => {
    if (!company || !inviteEmail.trim()) return;

    setIsSendingInvite(true);
    setInviteMessage(null);

    try {
      const result = await onboardingInviteService.createInvite(company.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
        course_id: inviteRole === "STUDENT" ? inviteCourseId : null,
      });

      if (result.success && result.data) {
        setInviteMessage({ type: "success", text: `Invite sent to ${inviteEmail.trim()}` });
        setInviteEmail("");
        const refreshed = await onboardingInviteService.listInvites(company.id);
        if (refreshed.success && refreshed.data) {
          setEmailInvites(refreshed.data);
        }
      } else {
        setInviteMessage({ type: "error", text: result.error || "Failed to send invite" });
      }
    } catch {
      setInviteMessage({ type: "error", text: "An error occurred while sending the invite" });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleSetupPayments = async () => {
    if (!user?.company_id) return;
    setIsSettingUpPayments(true);
    setPaymentMessage(null);
    try {
      const response = await paymentService.createConnectOnboarding(user.company_id);
      const opened = response?.url
        ? await openStripeHostedUrl(response.url)
        : false;
      if (!opened) {
        setPaymentMessage("Could not open Stripe onboarding URL.");
      }
    } catch {
      setPaymentMessage("Failed to start payment setup.");
    } finally {
      setIsSettingUpPayments(false);
    }
  };

  const handleSaveBookingLock = async () => {
    if (!user?.company_id || !company) return;

    const parsed = Number.parseInt(bookingLockHoursInput, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 168) {
      setBookingLockMessage("Enter a whole number between 0 and 168.");
      return;
    }

    setIsSavingBookingLock(true);
    setBookingLockMessage(null);
    try {
      const response = await companyService.updateCompany(Number(user.company_id), {
        booking_lock_hours: parsed,
      });
      if (response.success && response.data) {
        setCompany(response.data);
        setBookingLockHoursInput(String(response.data.booking_lock_hours ?? parsed));
        setBookingLockMessage("Booking lock window updated.");
      } else {
        setBookingLockMessage(response.error || "Failed to update booking lock window.");
      }
    } catch {
      setBookingLockMessage("An unexpected error occurred while saving booking lock.");
    } finally {
      setIsSavingBookingLock(false);
    }
  };

  const INVITE_ROLES = [
    { label: "Student", value: "STUDENT" },
    { label: "Instructor", value: "INSTRUCTOR" },
    { label: "Admin", value: "ADMIN" },
  ];

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Setup</Text>
              {isLoadingPaymentStatus ? (
                <Text style={{ color: themes.white, textAlign: "center" }}>
                  Checking payment status...
                </Text>
              ) : paymentStatus?.payment_enabled ? (
                <>
                  <Text
                    style={{
                      color: "#4ade80",
                      textAlign: "center",
                      fontFamily: "Chakra-Regular",
                    }}
                  >
                    Payments are active for your company.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, { marginTop: 8 }]}
                    onPress={() => router.push("/company/management/payments")}
                  >
                    <Text style={styles.buttonText}>Open Payments Page</Text>
                  </TouchableOpacity>
                </>
              ) : paymentStatus?.stripe_account_id ? (
                <>
                  <Text style={styles.sectionDescription}>
                    Stripe account is connected but setup is incomplete.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isSettingUpPayments && { opacity: 0.7 }]}
                    onPress={handleSetupPayments}
                    disabled={isSettingUpPayments}
                  >
                    <Text style={styles.buttonText}>
                      {isSettingUpPayments ? "Opening..." : "Complete Payment Setup"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.sectionDescription}>
                    Set up Stripe Connect to accept student subscription payments.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isSettingUpPayments && { opacity: 0.7 }]}
                    onPress={handleSetupPayments}
                    disabled={isSettingUpPayments}
                  >
                    <Text style={styles.buttonText}>
                      {isSettingUpPayments ? "Opening..." : "Set Up Payments"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {paymentMessage && (
                <Text
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    color: "#fbbf24",
                    fontFamily: "Chakra-Regular",
                  }}
                >
                  {paymentMessage}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Booking Lock Window</Text>
              <Text style={styles.sectionDescription}>
                Students cannot book sessions within this many hours of the session start time.
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter hours (0-168)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="number-pad"
                value={bookingLockHoursInput}
                onChangeText={(value) => {
                  setBookingLockHoursInput(value);
                  setBookingLockMessage(null);
                }}
              />
              <TouchableOpacity
                style={[styles.actionButton, isSavingBookingLock && { opacity: 0.7 }]}
                onPress={handleSaveBookingLock}
                disabled={isSavingBookingLock}
              >
                <Text style={styles.buttonText}>
                  {isSavingBookingLock ? "Saving..." : "Save Booking Lock"}
                </Text>
              </TouchableOpacity>
              {bookingLockMessage && (
                <Text
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    color: "#fbbf24",
                    fontFamily: "Chakra-Regular",
                  }}
                >
                  {bookingLockMessage}
                </Text>
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
            {/* Email Invite Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email Invites</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={inviteEmail}
                onChangeText={(text) => {
                  setInviteEmail(text);
                  setInviteMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 }}>
                {INVITE_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setInviteRole(r.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: themes.vegasGold,
                      backgroundColor: inviteRole === r.value ? themes.vegasGold : "transparent",
                    }}
                  >
                    <Text style={{
                      fontFamily: "Chakra-Bold",
                      fontSize: 14,
                      color: inviteRole === r.value ? themes.black : themes.vegasGold,
                    }}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {inviteRole === "STUDENT" && courses.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setInviteCourseId(null)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: themes.vegasGold,
                          backgroundColor: inviteCourseId === null ? themes.vegasGold : "transparent",
                        }}
                      >
                        <Text style={{
                          fontFamily: "Chakra-Regular",
                          fontSize: 13,
                          color: inviteCourseId === null ? themes.black : themes.white,
                        }}>
                          No Course
                        </Text>
                      </TouchableOpacity>
                      {courses.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setInviteCourseId(c.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: themes.vegasGold,
                            backgroundColor: inviteCourseId === c.id ? themes.vegasGold : "transparent",
                          }}
                        >
                          <Text style={{
                            fontFamily: "Chakra-Regular",
                            fontSize: 13,
                            color: inviteCourseId === c.id ? themes.black : themes.white,
                          }}>
                            {c.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {inviteMessage && (
                <Text style={{
                  marginTop: 8,
                  fontFamily: "Chakra-Regular",
                  fontSize: 14,
                  textAlign: "center",
                  color: inviteMessage.type === "success" ? "#4CAF50" : "#FF4444",
                }}>
                  {inviteMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { opacity: isSendingInvite || !inviteEmail.trim() ? 0.5 : 1 }]}
                onPress={handleSendEmailInvite}
                disabled={isSendingInvite || !inviteEmail.trim()}
              >
                {isSendingInvite ? (
                  <ActivityIndicator size="small" color={themes.black} />
                ) : (
                  <Text style={styles.buttonText}>Send Email Invite</Text>
                )}
              </TouchableOpacity>

              {emailInvites.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{
                    fontFamily: "Chakra-Bold",
                    fontSize: 16,
                    color: themes.vegasGold,
                    marginBottom: 8,
                  }}>
                    Recent Invites
                  </Text>
                  {emailInvites.slice(0, 10).map((inv) => (
                    <View key={inv.id} style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: "rgba(197,179,88,0.2)",
                    }}>
                      <Text style={{ fontFamily: "Chakra-Regular", fontSize: 14, color: themes.white }}>
                        {inv.target_email ?? "—"}
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
