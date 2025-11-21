import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { profileService } from "@/src/services/profileService";
import { ProfileDetailed } from "@/src/types/profile.types";
import { UserRole } from "@/src/types/auth.types";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { profileScreenStyles as styles } from "@/src/styles/profileScreen";
import { formatDateString } from "@/src/utils/dateTimeUtils";
import { themes } from "@/src/context/themes";

export default function UserProfilePage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Dynamic Profile Route - Viewing user ID:", userId);

  const numericUserId = userId ? parseInt(userId, 10) : null;

  const loadUserProfile = async () => {
    if (!numericUserId || isNaN(numericUserId)) {
      console.error("Invalid user Id provided:", userId);
      setError("Invalid user ID provided");
      setIsLoading(false);
      return;
    }

    const canViewProfile =
      user?.role === UserRole.INSTRUCTOR ||
      user?.role === UserRole.ADMIN ||
      (user?.role === UserRole.STUDENT &&
        user?.instructor_id === numericUserId);

    if (!canViewProfile) {
      console.log("Access denied for user role:", user?.role);
      setError("You do not have permission to view this profile.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Loading profile for user ID:", numericUserId);
      setIsLoading(true);
      setError(null);

      const result = await profileService.getUserProfile(numericUserId);

      if (result.success && result.data) {
        console.log("Profile loaded successfully");
        setProfile(result.data);
      } else {
        console.error("Failed to load profile:", result.error);
        setError(result.error || "Failed to load profile");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

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

  const getContactInfo = () => {
    if (!profile) return "";

    const email = profile.user.email?.trim() || "";
    const phone = profile.phone_number?.trim() || "";

    if (user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN) {
      if (phone && email) {
        return `${phone} • ${email}`;
      } else if (phone) {
        return phone;
      } else if (email) {
        return email;
      }
    } else if (user?.role === UserRole.STUDENT) {
      return email;
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
      return "Not Specified";
    }

    try {
      const formatted = formatDateString(profile.date_of_birth);

      if (formatted === "Invalid date") {
        return "Not Specified";
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
      return "Not Specified";
    }
  };

  const getUserInitials = (): string => {
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
              <TouchableOpacity style={styles.button} onPress={loadUserProfile}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Go Back</Text>
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
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
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
                  {getUserInitials()}
                </Text>
              </View>

              <View style={styles.profileBioContainer}>
                {user?.role !== UserRole.STUDENT && (
                  <Text style={styles.profileBioText}>
                    Birthday: {getDateOfBirth()}
                  </Text>
                )}
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
                  onPress={() => router.back()}
                >
                  <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </BackgroundGradient>
      </SafeAreaView>
    </View>
  );
}
