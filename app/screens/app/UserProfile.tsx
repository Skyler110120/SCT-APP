import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import BottomNavBar from "@/src/components/NavBar";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { profileScreenStyles as styles } from "@/src/styles/profileScreen";
import { useAuth } from "@/src/context/AuthContext";
import { profileService } from "@/src/services/profileService";
import { ProfileDetailed } from "@/src/types/profile.types";
import EditProfileModal from "@/src/components/EditProfileModal";
import { formatDateString } from "@/src/utils/dateTimeUtils";
import { themes } from "@/src/context/themes";

export default function InstructorProfile() {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

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
  }

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
    </View>;
  }
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <BackgroundGradient>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.profileName}>
              {getDisplayName()}
            </Text>

            <View style={styles.profileContentContainer}>
              <View style={styles.profilePictureContainer}>
                <Text style={[
                  styles.profileBioTextBottom,
                  {
                    textAlign: 'center',
                    paddingRight: 20,
                    fontSize: 48,
                    fontFamily: "Chakra-BoldItalic",
                    color: themes.vegasGold,
                  }
                ]}>
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
                <Text style={styles.profileBioTextBottom}>
                  Bio: {getBio()}
                </Text>
              </View>

              <View style={styles.buttonContainer}>
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
                  style={[
                    styles.button,
                    isLoggingOut && { opacity: 0.7 },
                  ]}
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
    </View>
  );
}
