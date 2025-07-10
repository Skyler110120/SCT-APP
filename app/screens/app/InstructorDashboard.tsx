import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { dashboardStyles } from "@/src/styles/instructorDashboard";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { OnboardingModal } from "@/src/components/OnboardingModal";
import { onboardingService } from "@/src/services/onboardingService";

export default function InstructorDashboard() {
  // Access router for navigation
  const router = useRouter();
  
  // Access auth context for user data and authentication functions
  const { state, logout, updateUser, needsOnboarding } = useAuth();
  const user = state.user;
  
  // State for onboarding modal visibility
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  // Current date and selected day for the calendar
  const [today] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  // Mock data for classes - in a real app, fetch this from your API
  const classesToday = [
    { time: '12:00 PM', instructor: 'Alan Honor', type: 'Ballet' },
    { time: '3:00 PM', instructor: 'Jeff Watts', type: 'Jazz' },
    { time: '5:00 PM', instructor: 'Tim Hardy', type: 'Contemporary' },
  ];

  // Show onboarding modal if user needs onboarding
  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboardingModal(true);
    } else {
      setShowOnboardingModal(false);
    }
  }, [needsOnboarding]);

  // Generate week days array on component mount
  useEffect(() => {
    const startDay = new Date(today);
    // Set to beginning of week (Sunday)
    startDay.setDate(today.getDate() - today.getDay());
    
    const days = [];
    // Generate array with 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [today]);

  // Format full date as "Month Day Year" (e.g. "June 3rd 2025")
  const formatFullDate = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Add appropriate suffix to day number
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    if (day % 10 === 2 && day !== 12) suffix = 'nd';
    if (day % 10 === 3 && day !== 13) suffix = 'rd';
    
    return `${month} ${day}${suffix} ${year}`;
  };

  // Format day name (e.g. "Mon")
  const formatDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Format day number with leading zero if needed
  const formatDayNumber = (date: Date) => {
    const day = date.getDate();
    return day < 10 ? `0${day}` : `${day}`;
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Logout function
  const handleLogout = async () => {
    await logout();
    router.replace("/screens/auth/Login");
  };

  // Handle invite code submission for onboarding
  const handleSubmitInviteCode = async (code: string) => {
    try {
      const companyData = await onboardingService.completeOnboarding(code);

      if (!companyData || !user) {
        throw new Error("Failed to validate invite code");
      }

      const updatedUser = await onboardingService.updateUserAfterOnboarding(
        user.id,
        companyData.company_id
      );

      if (updatedUser) {
        updateUser({
          company_id: companyData.company_id,
        });
      } else {
        throw new Error("Failed to join company");
      }
    } catch (error) {
      throw error;
    }
  };

  // If user needs onboarding, show simplified view with modal
  if (needsOnboarding) {
    return (
      <View style={dashboardStyles.container}>
        <View style={dashboardStyles.modalContent}>
          <Text style={dashboardStyles.modalTitle}>Welcome to Stone Cold Tactical</Text>
          <Text style={dashboardStyles.labelText}>
            Please enter your company invite code to access all features.
          </Text>
          <TouchableOpacity
            style={dashboardStyles.submitButton}
            onPress={handleLogout}
          >
            <Text style={dashboardStyles.buttonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>

        <OnboardingModal
          isVisible={showOnboardingModal}
          onSubmitCode={handleSubmitInviteCode}
          onLogout={handleLogout}
        />
      </View>
    );
  }

  // Main instructor dashboard view
  return (
    <SafeAreaView style={dashboardStyles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={dashboardStyles.scrollContent}>
        {/* Today's date section */}
        <View style={dashboardStyles.dateContainer}>
          <Text style={dashboardStyles.todayText}>Today</Text>
          <Text style={dashboardStyles.fullDateText}>{formatFullDate(today)}</Text>
        </View>
        
        {/* Week day selector */}
        <View style={dashboardStyles.weekContainer}>
          {weekDays.map((day, index) => {
            const dayNum = formatDayNumber(day);
            const dayName = formatDayName(day);
            const isSelected = isSameDay(day, selectedDay);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  dashboardStyles.dayButton, 
                  isSelected && dashboardStyles.selectedDayButton
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  dashboardStyles.dayName, 
                  isSelected && dashboardStyles.selectedDayText
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  dashboardStyles.dayNumber, 
                  isSelected && dashboardStyles.selectedDayText
                ]}>
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Videos section */}
        <View style={dashboardStyles.sectionContainer}>
          <Text style={dashboardStyles.sectionTitle}>Videos To Watch</Text>
          <View style={dashboardStyles.videosRow}>
            <View style={dashboardStyles.videoThumbnail} />
            <View style={dashboardStyles.videoThumbnail} />
          </View>
        </View>
        
        {/* Classes section */}
        <View style={dashboardStyles.sectionContainer}>
          <Text style={dashboardStyles.sectionTitle}>Classes Today</Text>
          
          {classesToday.map((classItem, index) => (
            <TouchableOpacity 
              key={index} 
              style={dashboardStyles.classCard}
              onPress={() => {
                // Navigate to class detail in the future
                console.log(`Viewing class: ${classItem.instructor}`);
              }}
            >
              <View style={dashboardStyles.classTypeSection}>
                <Text style={dashboardStyles.classTypeText}>
                  Profile Pic{"\n"}or{"\n"}Class Type
                </Text>
              </View>
              
              <View style={dashboardStyles.classInfoSection}>
                <Text style={dashboardStyles.classTimeText}>
                  {classItem.time} {classItem.instructor}
                </Text>
              </View>
              
              <View style={dashboardStyles.viewButtonSection}>
                <Text style={dashboardStyles.viewButtonText}>VIEW</Text>
                <Text style={dashboardStyles.arrowIcon}>➔</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Bottom navigation bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}