import BackgroundGradient from "@/src/components/BackgroundGradient";
import EditProfileModal from "@/src/components/EditProfileModal";
import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { courseService } from "@/src/services/courseService";
import { paymentService } from "@/src/services/paymentService";
import { profileService } from "@/src/services/profileService";
import { userService } from "@/src/services/userService";
import { profileScreenStyles as styles } from "@/src/styles/ProfilePageStyles/profileScreenStyles";
import { ProfileDetailed } from "@/src/types/profile.types";
import { SubscriptionStatusData } from "@/src/types/payment.types";
import { UserRole } from "@/src/types/enums";
import { formatDateString } from "@/src/utils/dateTimeUtils";
import { openStripeHostedUrl } from "@/src/utils/safeExternalUrl";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InstructorProfile() {
  const { logout, user } = useAuth();

  const [profile, setProfile] = useState<ProfileDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatusData | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [enrolledCourseId, setEnrolledCourseId] = useState<number | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user?.role !== UserRole.STUDENT) return;
    loadBillingData();
  }, [user?.role]);

  const loadProfile = async () => {
    try {
      console.log("Loading user profile...");
      setIsLoading(true);
      setError(null);

      const result = await profileService.getMyProfile();

      if (result.success && result.data) {
        console.log("Profile loaded successfully:", result.data);
        setProfile(result.data);
      } else {
        console.error("Failed to load profile:", result.error);
        setError(result.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("An unexpected error occurred while loading the profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBillingData = async () => {
    setIsLoadingBilling(true);
    try {
      const [subscriptionResponse, enrollmentResponse] = await Promise.all([
        paymentService.getSubscriptionStatus(),
        courseService.getMyEnrolledCourse(),
      ]);
      setSubscriptionStatus(subscriptionResponse);
      if (enrollmentResponse.success && enrollmentResponse.data?.course?.id) {
        setEnrollmentId(enrollmentResponse.data.id);
        setEnrolledCourseId(enrollmentResponse.data.course.id);
      } else {
        setEnrollmentId(null);
        setEnrolledCourseId(null);
      }
    } catch {
      setBillingMessage("Unable to load billing details right now.");
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleStartSubscriptionCheckout = async () => {
    if (enrolledCourseId == null) return;
    setIsCheckoutLoading(true);
    setBillingMessage(null);
    try {
      const response = await paymentService.createSubscriptionCheckout(
        enrolledCourseId
      );
      const opened = response.checkout_url
        ? await openStripeHostedUrl(response.checkout_url)
        : false;
      if (!opened) {
        setBillingMessage("Could not open Stripe checkout URL.");
      }
    } catch {
      setBillingMessage("Failed to start subscription checkout.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    setIsPortalLoading(true);
    setBillingMessage(null);
    try {
      const response = await paymentService.getPortalUrl();
      const opened = response.portal_url
        ? await openStripeHostedUrl(response.portal_url)
        : false;
      if (!opened) {
        setBillingMessage("Could not open Stripe billing portal.");
      }
    } catch {
      setBillingMessage("Failed to open billing portal.");
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleBuyMakeupSession = async () => {
    if (enrollmentId == null) return;
    setIsCheckoutLoading(true);
    setBillingMessage(null);
    try {
      const response = await paymentService.createMakeupCheckout(enrollmentId);
      const opened = response.checkout_url
        ? await openStripeHostedUrl(response.checkout_url)
        : false;
      if (!opened) {
        setBillingMessage("Could not open make-up checkout URL.");
      }
    } catch {
      setBillingMessage("Failed to start make-up checkout.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsUpdatingSubscription(true);
    setBillingMessage(null);
    try {
      const response = await paymentService.cancelSubscription();
      setBillingMessage(response.message || "Subscription will cancel at period end.");
      const refreshedStatus = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(refreshedStatus);
    } catch {
      setBillingMessage("Failed to cancel subscription.");
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsUpdatingSubscription(true);
    setBillingMessage(null);
    try {
      const response = await paymentService.reactivateSubscription();
      setBillingMessage(response.message || "Subscription reactivated.");
      const refreshedStatus = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(refreshedStatus);
    } catch {
      setBillingMessage("Failed to reactivate subscription.");
    } finally {
      setIsUpdatingSubscription(false);
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

  const handleEditProfile = () => {
    if (profile) {
      console.log("Opening edit modal with profile:", profile);
      setShowEditModal(true);
    } else {
      Alert.alert("Error", "Profile data is still loading. Please try again");
    }
  };

  const handleProfileUpdated = (updatedProfile: ProfileDetailed) => {
    console.log("Profile updated successfully:", updatedProfile);
    setProfile(updatedProfile);
    setShowEditModal(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleModalClose = () => {
    console.log("Edit modal closed");
    setShowEditModal(false);
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleOpenPasswordModal = () => {
    resetPasswordFields();
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill out all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Invalid Password", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation must match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await userService.updatePassword(user.id, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (!result.success) {
        Alert.alert("Error", result.error ?? "Failed to update password.");
        return;
      }
      Alert.alert("Success", result.message ?? "Password updated successfully.");
      setShowPasswordModal(false);
      resetPasswordFields();
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getDisplayName = (): string => {
    if (!profile) return "Loading...";

    const firstName = profile.user.first_name?.trim() || "";
    const lastName = profile.user.last_name?.trim() || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    if (firstName) return firstName;

    if (profile.user.email) {
      const emailUsername = profile.user.email.split("@")[0];
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }

    return "User";
  };

  const getContactInfo = (): string => {
    if (!profile) return "";

    const email = profile.user.email?.trim() || "";
    const phone = profile.phone_number?.trim() || "";

    if (phone && email) {
      return `${phone} • ${email}`;
    } else if (phone) {
      return `${phone}`;
    } else if (email) {
      return `${email}`;
    }

    return "No contact information available";
  };

  const getCourseInfo = (): string => {
    if (!profile) return "";
    if (!profile.course) return "No course assigned";

    if (profile.course.title) {
      return `${profile.course.title}`;
    }

    return "No course assigned";
  };

  const getBio = (): string => {
    if (!profile) return "";

    const bio = profile.bio?.trim() || "";

    if (!bio) {
      return "No bio available";
    }
    if (bio.length > 150) {
      return `${bio.substring(0, 147)}...`;
    }

    return bio;
  };

  const getDateOfBirth = (): string => {
    if (!profile || !profile.date_of_birth) {
      return "Not specified";
    }

    try {
      const formatted = formatDateString(profile.date_of_birth);

      if (formatted === "Invalid Date") {
        return "Not specified";
      }

      const birthDate = new Date(profile.date_of_birth);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return `${formatted} (${age} years old)`;
      }

      return formatted;
    } catch (error) {
      console.error("Error formatting date of birth:", error);
      return "Not specified";
    }
  };

  const getUserIntials = (): string => {
    if (!profile) return "?";

    const firstName = profile.user.first_name?.trim() || "";
    const lastName = profile.user.last_name?.trim() || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (profile.user.email) {
      return profile.user.email[0].toUpperCase();
    }
    return "?";
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <BackgroundGradient>
            <View
              style={[
                styles.profileContentContainer,
                { justifyContent: "center" },
              ]}
            >
              <ActivityIndicator size="large" color={themes.vegasGold} />
              <Text style={[styles.profileBioText, { marginTop: 20 }]}>
                Loading Your Profile...
              </Text>
            </View>
          </BackgroundGradient>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <BackgroundGradient>
            <View
              style={[
                styles.profileContentContainer,
                { justifyContent: "center" },
              ]}
            >
              <Text
                style={[
                  styles.profileBioText,
                  { textAlign: "center", marginBottom: 10 },
                ]}
              >
                Unable to load profile
              </Text>
              <Text
                style={[
                  styles.profileBioText,
                  {
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 30,
                    color: "#FF4444",
                  },
                ]}
              >
                {error}
              </Text>
              <TouchableOpacity style={styles.button} onPress={loadProfile}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </BackgroundGradient>
        </SafeAreaView>
        <BottomNavBar />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BackgroundGradient>
          <ScrollView
            style={{ flex: 1, maxWidth: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              width: "100%",
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Text style={styles.profileName}>{getDisplayName()}</Text>

            <View style={styles.profileContentContainer}>
              <View style={styles.profilePictureContainer}>
                <Text
                  style={[
                    styles.profileBioTextBottom,
                    {
                      textAlign: "center",
                      paddingRight: 20,
                      fontSize: 48,
                      fontFamily: "Chakra-BoldItalic",
                      color: themes.vegasGold,
                    },
                  ]}
                >
                  {getUserIntials()}
                </Text>
              </View>

              <View style={styles.profileBioContainer}>
                <Text style={styles.profileBioText}>
                  Birthday: {getDateOfBirth()}
                </Text>
                <Text style={styles.profileBioText}>
                  Course: {getCourseInfo()}
                </Text>
                <Text style={styles.profileBioText}>
                  Contact Info: {getContactInfo()}
                </Text>
                <Text style={styles.profileBioTextBottom}>Bio: {getBio()}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleOpenPasswordModal}
                  disabled={isSubmittingProfile || isLoggingOut}
                >
                  <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    isSubmittingProfile && { opacity: 0.7 },
                  ]}
                  onPress={handleEditProfile}
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile ? (
                    <ActivityIndicator size="small" color={themes.white} />
                  ) : (
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isLoggingOut && { opacity: 0.7 }]}
                  onPress={handleLogout}
                  disabled={isLoggingOut || isSubmittingProfile}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color={themes.white} />
                  ) : (
                    <Text style={styles.buttonText}>Log Out</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {user?.role === UserRole.STUDENT && (
              <View
                style={[
                  styles.profileContentContainer,
                  { marginTop: 18, borderColor: themes.vegasGold },
                ]}
              >
                <Text style={[styles.profileBioText, { textAlign: "center" }]}>
                  Billing & Subscription
                </Text>
                {isLoadingBilling ? (
                  <ActivityIndicator size="small" color={themes.vegasGold} />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.profileBioText,
                        { textAlign: "center", marginTop: 8 },
                      ]}
                    >
                      {subscriptionStatus?.can_book_sessions
                        ? "Subscription is active."
                        : "No active subscription found."}
                    </Text>
                    {subscriptionStatus?.status && (
                      <Text
                        style={[
                          styles.profileBioText,
                          {
                            textAlign: "center",
                            opacity: 0.8,
                            fontSize: 14,
                          },
                        ]}
                      >
                        Status: {subscriptionStatus.status}
                      </Text>
                    )}
                    <View
                      style={{
                        width: "100%",
                        marginTop: 10,
                        gap: 8,
                      }}
                    >
                      {!subscriptionStatus?.can_book_sessions && (
                        <TouchableOpacity
                          style={[
                            styles.button,
                            (isCheckoutLoading || enrolledCourseId == null) && { opacity: 0.7 },
                          ]}
                          onPress={handleStartSubscriptionCheckout}
                          disabled={isCheckoutLoading || enrolledCourseId == null}
                        >
                          <Text style={styles.buttonText}>
                            {isCheckoutLoading
                              ? "Opening Checkout..."
                              : "Start Subscription Checkout"}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {subscriptionStatus?.enrollment_phase === "POST_SUBSCRIPTION" && (
                        <TouchableOpacity
                          style={[styles.button, isCheckoutLoading && { opacity: 0.7 }]}
                          onPress={handleBuyMakeupSession}
                          disabled={isCheckoutLoading || enrollmentId == null}
                        >
                          <Text style={styles.buttonText}>
                            {isCheckoutLoading
                              ? "Opening Checkout..."
                              : "Buy Make-Up Session ($50)"}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {subscriptionStatus?.has_subscription && (
                        <>
                          <TouchableOpacity
                            style={[styles.button, isPortalLoading && { opacity: 0.7 }]}
                            onPress={handleOpenPortal}
                            disabled={isPortalLoading}
                          >
                            <Text style={styles.buttonText}>
                              {isPortalLoading
                                ? "Opening Billing Portal..."
                                : "Open Billing Portal"}
                            </Text>
                          </TouchableOpacity>
                          {subscriptionStatus.cancel_at_period_end ? (
                            <TouchableOpacity
                              style={[styles.button, isUpdatingSubscription && { opacity: 0.7 }]}
                              onPress={handleReactivateSubscription}
                              disabled={isUpdatingSubscription}
                            >
                              <Text style={styles.buttonText}>Reactivate Subscription</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={[styles.button, isUpdatingSubscription && { opacity: 0.7 }]}
                              onPress={handleCancelSubscription}
                              disabled={isUpdatingSubscription}
                            >
                              <Text style={styles.buttonText}>Cancel at Period End</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                      {billingMessage && (
                        <Text
                          style={{
                            color: "#fbbf24",
                            textAlign: "center",
                            fontFamily: "Chakra-Regular",
                          }}
                        >
                          {billingMessage}
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </BackgroundGradient>
      </SafeAreaView>

      <BottomNavBar />

      {profile && (
        <EditProfileModal
          visible={showEditModal}
          isSubmitting={isSubmittingProfile}
          profile={profile}
          onSave={handleProfileUpdated}
          onClose={handleModalClose}
        />
      )}

      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.92)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themes.vegasGold,
              padding: 16,
              gap: 10,
            }}
          >
            <Text style={{ color: themes.white, fontFamily: "Chakra-Bold", fontSize: 20 }}>
              Reset Password
            </Text>
            <TextInput
              placeholder="Current password"
              placeholderTextColor={themes.vegasGold}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: themes.vegasGold,
                borderRadius: 8,
                color: themes.white,
                paddingHorizontal: 10,
                paddingVertical: 10,
                fontFamily: "Chakra-Regular",
              }}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              placeholder="New password"
              placeholderTextColor={themes.vegasGold}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: themes.vegasGold,
                borderRadius: 8,
                color: themes.white,
                paddingHorizontal: 10,
                paddingVertical: 10,
                fontFamily: "Chakra-Regular",
              }}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor={themes.vegasGold}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: themes.vegasGold,
                borderRadius: 8,
                color: themes.white,
                paddingHorizontal: 10,
                paddingVertical: 10,
                fontFamily: "Chakra-Regular",
              }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1 }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  resetPasswordFields();
                }}
                disabled={isUpdatingPassword}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, opacity: isUpdatingPassword ? 0.7 : 1 }]}
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color={themes.white} />
                ) : (
                  <Text style={styles.buttonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
