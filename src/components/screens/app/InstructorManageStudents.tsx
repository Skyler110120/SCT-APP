import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import InstructorStudentFilters, {
  StudentStatusFilter,
} from "@/src/components/instructor/InstructorStudentFilters";
import InstructorStudentTable from "@/src/components/instructor/InstructorStudentTable";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { instructorService } from "@/src/services/instructorService";
import { instructorManageStudentsStyles as styles } from "@/src/styles/ManageUserPageStyles/Instructor/instructorManageUsersStyles";
import { User } from "@/src/types/auth.types";
import { UserRole } from "@/src/types/enums";

export default function InstructorStudents() {
  const { user } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await instructorService.getMyStudents();
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setStudents(list);
      } else {
        setStudents([]);
        setError(response.error || "Failed to load students");
        Alert.alert("Error", response.error || "Failed to load students");
      }
    } catch (loadError) {
      console.error("Error loading students:", loadError);
      setStudents([]);
      setError("An unexpected error occurred while loading students.");
      Alert.alert("Error", "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === UserRole.INSTRUCTOR) {
      loadMyStudents();
    } else if (user) {
      setIsLoading(false);
      setError("Access denied: Instructor role required.");
    }
  }, [user, loadMyStudents]);

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.first_name?.toLowerCase().includes(query) ||
          student.last_name?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((student) => student.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((student) => !student.is_active);
    }

    return filtered;
  }, [students, searchQuery, statusFilter]);

  const handleViewProfile = (student: User) => {
    router.push(`/learning/profile/${student.id}`);
  };

  const filtersHeader = (
    <>
      <Text style={styles.pageTitle}>My Students</Text>
      <InstructorStudentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {isLoading && students.length === 0 ? (
              <View style={styles.loadingContainer}>
                {filtersHeader}
                <ActivityIndicator size="large" color={themes.vegasGold} />
                <Text style={styles.loadingText}>Loading your students...</Text>
              </View>
            ) : error && students.length === 0 ? (
              <View style={styles.errorContainer}>
                {filtersHeader}
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadMyStudents}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <InstructorStudentTable
                students={filteredStudents}
                onViewProfile={handleViewProfile}
                isLoading={isLoading}
                ListHeaderComponent={filtersHeader}
              />
            )}
          </View>
        </SafeAreaView>
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
