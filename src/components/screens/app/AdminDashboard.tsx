import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
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
import { apiErrorMessage } from "@/src/utils/billingActions";

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
        paymentService.getConnectStatus(companyId).catch((statusError) => {
          console.error("Error fetching payment status:", statusError);
          return null;
        }),
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
      if (paymentStatusResponse?.payment_enabled !== undefined) {
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
      const companyId = Number(user.company_id);
      const response = await paymentService.createConnectOnboarding(companyId);
      const opened = response?.url
        ? await openStripeHostedUrl(response.url)
        : false;
      if (!opened) {
        setPaymentMessage("Could not open Stripe onboarding URL.");
        return;
      }
      setIsLoadingPaymentStatus(true);
      const status = await paymentService.getConnectStatus(companyId).catch(() => null);
      setIsLoadingPaymentStatus(false);
      if (status) {
        setPaymentStatus(status);
        setPaymentMessage(
          status.payment_enabled
            ? null
            : "Stripe hasn't finished verifying your account yet. Complete any remaining steps, or check back shortly."
        );
      }
    } catch (error) {
      setPaymentMessage(apiErrorMessage(error, "Failed to start payment setup."));
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
              <>
                <Text
                  style={styles.pageTitle}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {company.name}
                </Text>
                <Text style={styles.pageSubtitle}>Dashboard</Text>
              </>
            )}
            {isLoading && (
              <Text style={styles.pageSubtitle}>Loading company data...</Text>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Setup</Text>
              {isLoadingPaymentStatus ? (
                <Text style={styles.sectionDescription}>Checking payment status...</Text>
              ) : paymentStatus?.payment_enabled ? (
                <>
                  <Text style={[styles.sectionDescription, { color: themes.success }]}>
                    Payments are active for your company.
                  </Text>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push("/company/management/payments")}
                  >
                    <Text style={styles.buttonText} numberOfLines={1}>
                      Open Payments
                    </Text>
                  </TouchableOpacity>
                </>
              ) : paymentStatus?.stripe_account_id ? (
                <>
                  <Text style={styles.sectionDescription}>
                    Stripe is connected, but setup is still incomplete.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isSettingUpPayments && { opacity: 0.7 }]}
                    onPress={handleSetupPayments}
                    disabled={isSettingUpPayments}
                  >
                    <Text style={styles.buttonText} numberOfLines={1}>
                      {isSettingUpPayments ? "Opening..." : "Finish Setup"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.sectionDescription}>
                    Connect Stripe to accept student subscription payments.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isSettingUpPayments && { opacity: 0.7 }]}
                    onPress={handleSetupPayments}
                    disabled={isSettingUpPayments}
                  >
                    <Text style={styles.buttonText} numberOfLines={1}>
                      {isSettingUpPayments ? "Opening..." : "Set Up Payments"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {paymentMessage && (
                <Text style={[styles.feedbackText, { color: themes.warning }]}>
                  {paymentMessage}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking lock</Text>
              <Text style={styles.sectionDescription}>
                Students cannot book a session inside this many hours of its start time.
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter hours (0-168)"
                placeholderTextColor="rgba(237,235,227,0.4)"
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
                <Text style={styles.buttonText} numberOfLines={1}>
                  {isSavingBookingLock ? "Saving..." : "Save Booking Lock"}
                </Text>
              </TouchableOpacity>
              {bookingLockMessage && (
                <Text style={[styles.feedbackText, { color: themes.warning }]}>
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
                <Text style={styles.buttonText} numberOfLines={1}>
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
                placeholderTextColor="rgba(237,235,227,0.4)"
                value={inviteEmail}
                onChangeText={(text) => {
                  setInviteEmail(text);
                  setInviteMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.roleRow}>
                {INVITE_ROLES.map((r) => {
                  const selected = inviteRole === r.value;
                  return (
                    <TouchableOpacity
                      key={r.value}
                      onPress={() => setInviteRole(r.value)}
                      style={[styles.roleChip, selected && styles.roleChipSelected]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.roleChipText, selected && styles.roleChipTextSelected]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {inviteRole === "STUDENT" && courses.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.courseChipRow}>
                      <TouchableOpacity
                        onPress={() => setInviteCourseId(null)}
                        style={[
                          styles.courseChip,
                          inviteCourseId === null && styles.courseChipSelected,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.courseChipText,
                            inviteCourseId === null && styles.courseChipTextSelected,
                          ]}
                        >
                          No course
                        </Text>
                      </TouchableOpacity>
                      {courses.map((c) => {
                        const selected = inviteCourseId === c.id;
                        return (
                          <TouchableOpacity
                            key={c.id}
                            onPress={() => setInviteCourseId(c.id)}
                            style={[styles.courseChip, selected && styles.courseChipSelected]}
                          >
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.courseChipText,
                                selected && styles.courseChipTextSelected,
                              ]}
                            >
                              {c.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}

              {inviteMessage && (
                <Text
                  style={[
                    styles.feedbackText,
                    { color: inviteMessage.type === "success" ? themes.success : themes.danger },
                  ]}
                >
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
                  <Text style={styles.buttonText} numberOfLines={1}>
                    Send Email Invite
                  </Text>
                )}
              </TouchableOpacity>

              {emailInvites.length > 0 && (
                <View>
                  <Text style={styles.recentTitle}>Recent invites</Text>
                  {emailInvites.slice(0, 10).map((inv) => (
                    <View key={inv.id} style={styles.inviteRow}>
                      <Text style={styles.inviteEmail} numberOfLines={1}>
                        {inv.target_email ?? "—"}
                      </Text>
                      <Text style={styles.inviteMeta} numberOfLines={1}>
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
              <Text style={styles.buttonText} numberOfLines={1}>
                Log Out
              </Text>
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
