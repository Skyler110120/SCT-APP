import React, {useState} from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import BottomNavBar from "@/src/components/NavBar";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { profileScreenStyles } from "@/src/styles/profileScreen";
import { useAuth } from "@/src/context/AuthContext";

interface ProfileInformation {
  name: string;
  email: string;
  bio: string;
  dateOfBirth: string;
  profilePicture: string;
  contactInfo: string;
  courses: string[];
}

export default function InstructorProfile() {
  const { logout} = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileInfo: ProfileInformation = {
    name: "Robert Teach",
    email: "robert.teach@example.com",
    bio: "BIO: A passionate firearms instructor with over 10 years of experience in teaching handgun safety and marksmanship.",
    dateOfBirth: "Date Of Birth: 04/11/1998",
    profilePicture: "https://example.com/profile.jpg",
    contactInfo: "Contact Info: 931-###-####/contactme@example.com",
    courses: ["Handgun Safety", "Marksmanship"],
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={profileScreenStyles.container}>
      <SafeAreaView style={profileScreenStyles.safeArea}>
        <BackgroundGradient>
          <Text style={profileScreenStyles.profileName}>
            {profileInfo.name}
          </Text>
          <View style={profileScreenStyles.profileContentContainer}>
            <View style={profileScreenStyles.profilePictureContainer}></View>
            <View style={profileScreenStyles.profileBioContainer}>
              <Text style={profileScreenStyles.profileBioText}>
                {profileInfo.dateOfBirth}
              </Text>
              <Text style={profileScreenStyles.profileBioText}>
                {"Courses: " + profileInfo.courses.join(", ")}
              </Text>
              <Text style={profileScreenStyles.profileBioText}>
                {profileInfo.contactInfo}
              </Text>
              <Text style={profileScreenStyles.profileBioTextBottom}>
                {profileInfo.bio}
              </Text>
            </View>
            <View style={profileScreenStyles.buttonContainer}>
              <TouchableOpacity
                style={profileScreenStyles.button}
                onPress={() => {}}
              >
                <Text style={profileScreenStyles.buttonText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={profileScreenStyles.button}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <Text style={profileScreenStyles.buttonText}>
                  {isLoggingOut ? "Logging Out..." : "Log Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BackgroundGradient>
      </SafeAreaView>
      <BottomNavBar />
    </View>
  );
}
