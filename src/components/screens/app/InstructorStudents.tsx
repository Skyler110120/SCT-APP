import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import InstructorStudentFilters from "@/src/components/instructor/InstructorStudentFilters";
import InstructorStudentTable from "@/src/components/instructor/InstructorStudentTable";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { instructorService } from "@/src/services/instructorService";
import { manageUsersStyles as styles } from "@/src/styles/UserPageStyles/manageUsers";
import { User } from "@/src/types/auth.types";

export default function InstructorStudents() {
  const { user } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "instructor") {
      loadMyStudents();
    } else {
      setIsLoading(false);
      setError("Access denied: Instructor role required.");
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [students, searchQuery, statusFilter]);

  const loadMyStudents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading my students");
      const response = await instructorService.getMyStudents();
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        console.error("Failed to load students:", response.error);
        setError(response.error || "Failed to load students");
        Alert.alert("Error", response.error || "Failed to load students");
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError("An unexpected error occurred while loading students.");
      Alert.alert("Error", "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.first_name.toLowerCase().includes(query) ||
          student.last_name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(student => student.is_active && student.has_completed_onboarding)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(student => !student.is_active)
      }
    }

    setFilteredStudents(filtered);
  };

  const handleViewProfile = (student: User) => {
    console.log('Instructor viewing student profile:', student.email);
    console.log('Navigating to profile ID:', student.id)

    router.push(`/learning/profile/${student.id}`);
  }

  const handleRetryLoad = () => {
    loadMyStudents();
  }

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.pageTitle}>My Students</Text>

            <InstructorStudentFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <View style={styles.tableSection}>
              {isLoading && students.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                  <Text style={styles.loadingText}>Loading your students...</Text>
                </View>
              ) : error && students.length === 0 ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetryLoad}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <InstructorStudentTable
                  students={filteredStudents}
                  onViewProfile={handleViewProfile}
                  isLoading={isLoading}
                />
              )}

              {isLoading && students.length > 0 && (
                <View
                  style={[
                    styles.loadingContainer,
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.7)",
                    },
                  ]}
                >
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  )
}
