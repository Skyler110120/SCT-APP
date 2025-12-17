import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { instructorDashboardStyles as styles } from "@/src/styles/DashboardPageStyles/InstructorDashboardStyles/instructorDashboardStyles";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";

export default function InstructorDashboard() {
  const { state, logout, updateUser, needsOnboarding } = useAuth();
  
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  const [today] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const classesToday = [
    { time: '12:00 PM', instructor: 'Alan Honor', type: 'Ballet' },
    { time: '3:00 PM', instructor: 'Jeff Watts', type: 'Jazz' },
    { time: '5:00 PM', instructor: 'Tim Hardy', type: 'Contemporary' },
  ];

  useEffect(() => {
    if (needsOnboarding) {
      setShowOnboardingModal(true);
    } else {
      setShowOnboardingModal(false);
    }
  }, [needsOnboarding]);

  useEffect(() => {
    const startDay = new Date(today);

    startDay.setDate(today.getDate() - today.getDay());
    
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [today]);

  const formatFullDate = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    if (day % 10 === 2 && day !== 12) suffix = 'nd';
    if (day % 10 === 3 && day !== 13) suffix = 'rd';
    
    return `${month} ${day}${suffix} ${year}`;
  };

  const formatDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatDayNumber = (date: Date) => {
    const day = date.getDate();
    return day < 10 ? `0${day}` : `${day}`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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

  if (needsOnboarding) {
    return (
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Welcome to Stone Cold Tactical</Text>
          <Text style={styles.labelText}>
            Please enter your company invite code to access all features.
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView style={styles.scrollContent}>
        <View style={styles.dateContainer}>
          <Text style={styles.todayText}>Today</Text>
          <Text style={styles.fullDateText}>{formatFullDate(today)}</Text>
        </View>
        
        <View style={styles.weekContainer}>
          {weekDays.map((day, index) => {
            const dayNum = formatDayNumber(day);
            const dayName = formatDayName(day);
            const isSelected = isSameDay(day, selectedDay);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton, 
                  isSelected && styles.selectedDayButton
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayName, 
                  isSelected && styles.selectedDayText
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.dayNumber, 
                  isSelected && styles.selectedDayText
                ]}>
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Videos To Watch</Text>
          <View style={styles.videosRow}>
            <View style={styles.videoThumbnail} />
            <View style={styles.videoThumbnail} />
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Classes Today</Text>
          
          {classesToday.map((classItem, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.classCard}
              onPress={() => {
                console.log(`Viewing class: ${classItem.instructor}`);
              }}
            >
              <View style={styles.classTypeSection}>
                <Text style={styles.classTypeText}>
                  Profile Pic{"\n"}or{"\n"}Class Type
                </Text>
              </View>
              
              <View style={styles.classInfoSection}>
                <Text style={styles.classTimeText}>
                  {classItem.time} {classItem.instructor}
                </Text>
              </View>
              
              <View style={styles.viewButtonSection}>
                <Text style={styles.viewButtonText}>VIEW</Text>
                <Text style={styles.arrowIcon}>➔</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}