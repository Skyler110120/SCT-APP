import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import CourseOverviewCard from "@/src/components/CourseOverviewCard";
import BottomNavBar from "@/src/components/NavBar";
import StudentProgressModal from "@/src/components/StudentProgressModal";
import VideoListModal from "@/src/components/VideoListModal";
import { courseScreenStyles as styles } from "@/src/styles/CoursePageStyles/courseScreenStyles";

import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { courseService } from "@/src/services/courseService";
import { enrollmentService } from "@/src/services/enrollmentService";
import { materialService } from "@/src/services/materialService";

import { UserRole } from "@/src/types/enums";
import {
  CourseInstructorView,
  CourseStudentView,
  CourseView,
} from "@/src/types/course.types";
import {
  InstructorStats,
  Stats,
  StudentStats,
  StudentWeeklyProgress
} from "@/src/types/enrollment.types";

export default function Courses() {
  const { user } = useAuth();

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isStudent = user?.role === UserRole.STUDENT;

  const canViewAllCourses = isInstructor || isAdmin;
  const canViewStats = isInstructor || isAdmin;
  const canViewStudentProgress = isInstructor || isAdmin;
  const canUpdateStudentProgress = isInstructor;
  const canViewInstructorScript = isInstructor || isAdmin;
  const shouldShowCourseMaterials = true;
  const shouldShowVideos = true;

  const [courses, setCourses] = useState<CourseView[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseView | null>(null);
  const [studentProgress, setStudentProgress] = useState<
    StudentWeeklyProgress[]
  >([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [studentProgressVisible, setStudentProgressVisible] =
    useState<boolean>(false);
  const [videoListVisible, setVideoListVisible] = useState<boolean>(false);
  const [accessingMaterial, setAccessingMaterial] = useState<{
    type: "pdf" | "script" | null;
    loading: boolean;
  }>({ type: null, loading: false });

  const getPageTitle = () => {
    if (isAdmin) return "Course Overview";
    if (isInstructor) return "Teaching Dashboard";
    if (isStudent) return "Course Material";
    return "Dashboard";
  };

  const getCourseSectionTitle = () => {
    if (isAdmin) return "Company Courses";
    if (isInstructor) return "Your Courses";
    if (isStudent) return "My Course";
    return "Available Courses";
  };

  const isInstructorCourse = (
    course: CourseView
  ): course is CourseInstructorView => {
    return course.viewType === "instructor";
  };

  const isStudentCourse = (course: CourseView): course is CourseStudentView => {
    return course.viewType === "student";
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const promises = [fetchCourses()];

    if (canViewStudentProgress) {
      promises.push(fetchStudentProgress());
    }

    await Promise.all(promises);
  };

  const fetchStudentCourse = async () => {
    try {
      const response = await courseService.getMyEnrolledCourse();

      if (response.success && response.data && response.data.course) {
        const enrollmentData = response.data;

        const studentCourse: CourseView = {
          ...enrollmentData.course,
          viewType: "student",
        };

        console.log("Student course data:", studentCourse);
        setCourses([studentCourse]);
        setSelectedCourse(studentCourse);
      } else {
        console.warn("No enrolled course found");
        setCourses([]);
        setError("No enrolled course found. Please contact your administrator");
      }
    } catch (error) {
      console.error("Error fetching student course:", error);
      setCourses([]);
      setError("Unable to load your course. Please try again later.");
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await courseService.getCoursesForInstructor();

      if (response.success && response.data) {
        const instructorCourse = Array.isArray(response.data)
          ? response.data
          : [response.data];

        const courseData: CourseView[] = instructorCourse.map(
          (course: any) => ({
            ...course,
            viewType: "instructor" as const,
          })
        );

        console.log("Instructor courses data:", courseData);

        setCourses(courseData);

        if (courseData.length > 0 && !selectedCourse) {
          setSelectedCourse(courseData[0]);
        }
      } else {
        console.warn("No course found for instructor");
        setCourses([]);
        setError("No courses assigned. Please contact your administrator.");
      }
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      setCourses([]);
      setError("Unable to load your courses. Please try again later.");
    }
  };

  /** Company Admin: fetch all courses via admin endpoint (companies get access to all courses). */
  const fetchAdminCourses = async () => {
    try {
      const response = await courseService.getCoursesForAdmin();

      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : [response.data];
        const courseData: CourseView[] = list.map((course: any) => ({
          ...course,
          viewType: "instructor" as const,
        }));

        setCourses(courseData);
        if (courseData.length > 0 && !selectedCourse) {
          setSelectedCourse(courseData[0]);
        }
      } else {
        setCourses([]);
        setError(response.error || "Failed to load company courses.");
      }
    } catch (error) {
      console.error("Error fetching admin courses:", error);
      setCourses([]);
      setError("Unable to load company courses. Please try again later.");
    }
  };

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    setError(null);

    try {
      if (isStudent) {
        await fetchStudentCourse();
      } else if (isAdmin) {
        await fetchAdminCourses();
      } else {
        await fetchInstructorCourses();
      }
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchStudentProgress = async () => {
    if (!canViewStudentProgress) return;

    setIsLoadingProgress(true);
    try {
      const response = await enrollmentService.getStudentProgress();

      if (response.success && response.data) {
        setStudentProgress(response.data);
      } else {
        console.warn("Could not load student progress:", response.error);
      }
    } catch (error) {
      console.error("Error fetching student progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    console.log(`Refreshing dashboard for ${user?.role}`);
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [user?.role]);

  const handleSelectCourse = (course: CourseView) => {
    console.log("Selected course:", course.title);
    setSelectedCourse(course);
  };

  const openDocument = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Cannot Open Document",
          `Unable to open ${title}. You may need a PDF reader app installed.`
        );
      }
    } catch {
      Alert.alert("Error", `Failed to open ${title}. Please try again.`);
    }
  };

  const handleOpenPDF = async (course: CourseView) => {
    const hasPdfMaterial = Boolean(course.pdf_s3_key?.trim());

    if (!hasPdfMaterial) {
      Alert.alert(
        "No Plan Availabile",
        "Student PDF materials have notbeen uploaded for this course yet."
      );
      return;
    }
    setAccessingMaterial({ type: "pdf", loading: true });

    try {
      console.log("Requesting secure PDF access for course:", course.id);
      const response = await materialService.getCoursePdfAccess(course.id);

      if (response.success && response.data) {
        console.log("Got presigned URL, opening PDF...");
        await openDocument(response.data.access_url, "Course Materials");
      } else {
        console.error("Failed to get PDF access:", response.error);
        Alert.alert(
          "Access Failed",
          response.error || "Unable to access course materials at this time"
        );
      }
    } catch (error) {
      console.error("Error accessing PDF:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while accessing materials. Please try again"
      );
    } finally {
      setAccessingMaterial({ type: null, loading: false });
    }
  };

  const handleOpenScript = async (course: CourseView) => {
    if (!canViewInstructorScript) {
      Alert.alert(
        "No Script Available",
        "Instructor script has not been uploaded for this course yet."
      );
      return;
    }

    const hasScript = Boolean(course.instructor_script_s3_key?.trim());

    if (!hasScript) {
      Alert.alert(
        "No Script Available",
        "Instructor script has not been uploaded for this course yet."
      );
      return;
    }
    
    setAccessingMaterial({ type: "script", loading: true });

    try {
      console.log("Requesting secure script access")
      const response = await materialService.getInstructorScriptAccess(course.id);

      if (response.success && response.data) {
        console.log("Got presigned URL, opening script...");
        await openDocument(response.data.access_url, "Instructor Script");
      } else {
        console.error("Failed to get script access:", response.error);
        Alert.alert(
          "Access Failed",
          response.error || "Unable to access instructor script at this time"
        )
      }
    } catch (error) {
      console.error("Error accessing script:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while accessing script. Please try again"
      )
    } finally {
      setAccessingMaterial({ type: null, loading: false });
    }
  };

  const handleViewVideos = (course: CourseView) => {
    if (!course.videos || course.videos.length === 0) {
      Alert.alert(
        "No Videos Available",
        "No videos have been added to this course yet"
      );
      return;
    }
    console.log(`Opening video list for: ${course.title}`);
    setVideoListVisible(true);
  };

  const handleViewStudentProgress = () => {
    if (!canViewStudentProgress) {
      Alert.alert(
        "Access Restricted",
        "Student progress viewing is not available."
      );
      return;
    }
    console.log("Opening student progress overview");
    setStudentProgressVisible(true);
  };

  const handleUpdateStudentProgress = async (progressData: any) => {
    if (!canUpdateStudentProgress) {
      Alert.alert("Access Restricted", "You cannot update student progress.");
      return;
    }

    try {
      const response = await enrollmentService.updateStudentProgress(
        progressData
      );
      if (response.success) {
        Alert.alert("Success", "Student progress updated successfully");
        await fetchStudentProgress();
      } else {
        Alert.alert(
          "Error",
          response.error || "Failed to update student progress"
        );
      }
    } catch (error) {
      console.error("Error updating student progress:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again");
    }
  };

  const handleRetryFetch = () => {
    console.log("Retrying course fetch");
    fetchDashboardData();
  };

  const getStatistics = (): Stats => {
    if (isStudent) {
      const enrolledCourse = courses.length > 0 ? courses[0] : null;

      const myProgress = studentProgress.find(
        (progress) =>
          progress.student_name === `${user?.first_name} ${user?.last_name}`
      );

      if (enrolledCourse && isStudentCourse(enrolledCourse)) {
        return {
          type: "student",
          courseTitle: enrolledCourse.title,
          totalWeeks: enrolledCourse.total_weeks || 24,
          videosAvailable: enrolledCourse.videos?.length || 0,
          currentWeek: myProgress?.current_week || 0,
          progressPercentage: Math.round(myProgress?.progress_percentage || 0),
        };
      } else {
        return {
          type: "student",
          courseTitle: "No Course Enrolled",
          totalWeeks: 24,
          videosAvailable: 0,
          currentWeek: 1,
          progressPercentage: 0,
        };
      }
    } else {
      return {
        type: "instructor",
        totalCourses: courses.length,
        totalStudents: studentProgress.length,
        studentsInProgress: studentProgress.filter(
          (student) => student.progress_percentage < 100
        ).length,
      };
    }
  };

  const renderStudentStats = (stats: StudentStats) => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Week {stats.currentWeek}</Text>
            <Text style={styles.statLabel}>Current Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.progressPercentage}</Text>
            <Text style={styles.statLabel}>Course Complete</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.videosAvailable}</Text>
            <Text style={styles.statLabel}>Videos Available</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInstructorStats = (stats: InstructorStats) => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Active Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>
              {isAdmin ? "All Students" : "Students"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.studentsInProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsSection = () => {
    const stats = getStatistics();
    if (stats.type === "student") {
      return renderStudentStats(stats);
    } else {
      return renderInstructorStats(stats);
    }
  };

  const renderCourseCard = useCallback(
    ({ item }: { item: CourseView }) => {
      let studentsInCourse = 0;
      if (isInstructorCourse(item)) {
        studentsInCourse = studentProgress.filter(
          (student) => student.course_title === item.title
        ).length;
      }

      return (
        <CourseOverviewCard
          course={item}
          studentCount={studentsInCourse}
          isSelected={selectedCourse?.id === item.id}
          onSelect={() => handleSelectCourse(item)}
          showStudentCount={canViewStudentProgress && isInstructorCourse(item)}
          showMaterialAccess={false}
        />
      );
    },
    [selectedCourse, studentProgress, canViewStudentProgress, user?.role]
  );

  const renderActionButtons = () => {
    if (!selectedCourse) {
      const noSelectionMessage = isStudent
        ? "Loading your course materials..."
        : "Select a course above to access materials and actions";
      return (
        <View style={styles.noSelectionContainer}>
          <FontAwesome
            name={isStudent ? "book" : "hand-o-up"}
            size={32}
            color={themes.vegasGold + "60"}
          />
          <Text style={styles.noSelectionText}>{noSelectionMessage}</Text>
        </View>
      );
    }

    const hasPdfMaterial = Boolean(selectedCourse.pdf_s3_key?.trim());
    const hasScriptMaterial = Boolean(selectedCourse.instructor_script_s3_key?.trim());

    return (
      <View style={styles.selectedCourseSection}>
        <View style={styles.selectedCourseHeader}>
          <View style={styles.selectedCourseInfo}>
            <Text style={styles.selectedCourseTitle}>
              {selectedCourse.title}
            </Text>
            <Text style={styles.selectedCourseDescription}>
              {selectedCourse.description || "No description available"}
            </Text>

            <View style={styles.selectedCourseMeta}>
              <View style={styles.metaBadge}>
                <FontAwesome
                  name="graduation-cap"
                  size={20}
                  color={themes.vegasGold}
                />
                <Text style={styles.metaBadgeText}>
                  {selectedCourse.difficulty_level}
                </Text>
              </View>
              <View style={styles.metaBadge}>
                <FontAwesome
                  name="bullseye"
                  size={20}
                  color={themes.vegasGold}
                />
                <Text style={styles.metaBadgeText}>
                  {selectedCourse.required_gun_type}
                </Text>
              </View>
              <View style={styles.metaBadge}>
                <FontAwesome
                  name="play-circle"
                  size={20}
                  color={themes.vegasGold}
                />
                <Text style={styles.metaBadgeText}>
                  {selectedCourse.videos?.length || 0} videos
                </Text>
              </View>

              {isStudent && isStudentCourse(selectedCourse) && (
                <View style={styles.metaBadge}>
                  <FontAwesome
                    name="calendar"
                    size={20}
                    color={themes.vegasGold}
                  />
                  <Text style={styles.metaBadgeText}>
                    {selectedCourse.total_weeks} weeks total
                  </Text>
                </View>
              )}

              {canViewStudentProgress && isInstructorCourse(selectedCourse) && (
                <View style={styles.metaBadge}>
                  <FontAwesome
                    name="users"
                    size={20}
                    color={themes.vegasGold}
                  />
                  <Text style={styles.metaBadgeText}>
                    {
                      studentProgress.filter(
                        (s) => s.course_title === selectedCourse.title
                      ).length
                    }{" "}
                    students
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.actionButtonsGrid}>
          <Text style={styles.actionButtonsTitle}>
            {isStudent ? "My Course Materials" : "Course Materials & Actions"}
          </Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !hasPdfMaterial && styles.actionButtonDisabled,
                accessingMaterial.type === 'pdf' && { opacity: 0.7 }
              ]}
              onPress={() => handleOpenPDF(selectedCourse)}
              disabled={!hasPdfMaterial || accessingMaterial.loading}
              activeOpacity={0.7}
            >
              <FontAwesome
                name={accessingMaterial.type === 'pdf' ? "spinner" : "file-pdf-o"}
                size={24}
                color={
                  hasPdfMaterial && !accessingMaterial.loading
                    ? themes.vegasGold
                    : themes.white 
                }
              />
              <Text
                style={[
                  styles.actionButtonTitle,
                  !hasPdfMaterial && styles.actionButtonTitleDisabled,
                ]}
              >
                {isStudent ? "Course Materials" : "Teaching Materials"}
              </Text>
              <Text
                style={[
                  styles.actionButtonSubtitle,
                  !hasPdfMaterial && styles.actionButtonSubtitleDisabled,
                ]}
              >
                {accessingMaterial.type === 'pdf' 
                  ? "Loading..." 
                  : hasPdfMaterial 
                    ? "View PDF"
                    : "Not available"}
              </Text>
            </TouchableOpacity>

            {canViewInstructorScript && isInstructorCourse(selectedCourse) && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  !hasScriptMaterial && styles.actionButtonDisabled,
                  accessingMaterial.type === 'script' && { opacity: 0.7 }
                ]}
                onPress={() => handleOpenScript(selectedCourse)}
                disabled={!hasScriptMaterial || accessingMaterial.loading}
                activeOpacity={0.7}
              >
                <FontAwesome
                  name={accessingMaterial.type === 'script' ? "spinner" : "file-text-o"}
                  size={24}
                  color={
                    hasScriptMaterial && !accessingMaterial.loading
                      ? themes.vegasGold
                      : themes.white + "60"
                  }
                />
                <Text
                  style={[
                    styles.actionButtonTitle,
                    !hasScriptMaterial && styles.actionButtonTitleDisabled,
                  ]}
                >
                  Teaching Script
                </Text>
                <Text
                  style={[
                    styles.actionButtonSubtitle,
                    !hasScriptMaterial && styles.actionButtonSubtitleDisabled,
                  ]}
                >
                  {accessingMaterial.type === 'script'
                    ? "Loading..."
                    : hasScriptMaterial
                      ? "View Script"
                      : "Not available"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                (!selectedCourse.videos ||
                  selectedCourse.videos.length === 0) &&
                  styles.actionButtonDisabled,
              ]}
              onPress={() => handleViewVideos(selectedCourse)}
              disabled={
                !selectedCourse.videos || selectedCourse.videos.length === 0
              }
              activeOpacity={0.7}
            >
              <FontAwesome
                name="video-camera"
                size={24}
                color={
                  selectedCourse.videos && selectedCourse.videos.length > 0
                    ? themes.vegasGold
                    : themes.white + "60"
                }
              />
              <Text
                style={[
                  styles.actionButtonTitle,
                  (!selectedCourse.videos ||
                    selectedCourse.videos.length === 0) &&
                    styles.actionButtonTitleDisabled,
                ]}
              >
                Course Videos
              </Text>
              <Text
                style={[
                  styles.actionButtonSubtitle,
                  (!selectedCourse.videos ||
                    selectedCourse.videos.length === 0) &&
                    styles.actionButtonSubtitleDisabled,
                ]}
              >
                {selectedCourse.videos && selectedCourse.videos.length > 0
                  ? `${selectedCourse.videos.length} videos`
                  : "No videos added"}
              </Text>
            </TouchableOpacity>

            {canViewStudentProgress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleViewStudentProgress}
                activeOpacity={0.7}
              >
                <FontAwesome name="users" size={24} color={themes.vegasGold} />
                <Text style={styles.actionButtonTitle}>
                  {isAdmin ? "All Students" : "Student Progress"}
                </Text>
                <Text style={styles.actionButtonSubtitle}>
                  Track learning progress
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[themes.vegasGold]}
                tintColor={themes.vegasGold}
              />
            }
          >
            <View style={styles.contentContainer}>
              <View style={styles.headerSection}>
                <Text style={styles.pageTitle}>{getPageTitle()}</Text>

                {renderStatsSection()}
              </View>
              {(canViewAllCourses || courses.length > 1) && (
                <View style={styles.courseListSection}>
                  <Text style={styles.sectionTitle}>
                    {getCourseSectionTitle()}
                  </Text>

                  {isLoadingCourses && courses.length === 0 ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="large"
                        color={themes.vegasGold}
                      />
                      <Text style={styles.loadingText}>Loading courses...</Text>
                    </View>
                  ) : error && courses.length === 0 ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetryFetch}
                      >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.horizontalListContainer}>
                      <FlatList
                        data={courses}
                        renderItem={renderCourseCard}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalListContent}
                        ListEmptyComponent={() => (
                          <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>
                              {isAdmin
                                ? "No active courses in your company curriculum"
                                : "No courses available"}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  )}
                </View>
              )}
              <View style={styles.actionsSection}>{renderActionButtons()}</View>
            </View>
          </ScrollView>
        </SafeAreaView>
        {canViewStudentProgress && (
          <StudentProgressModal
            visible={studentProgressVisible}
            students={studentProgress}
            isLoading={isLoadingProgress}
            canUpdate={canUpdateStudentProgress}
            userRole={user?.role}
            onClose={() => setStudentProgressVisible(false)}
            onUpdateProgress={handleUpdateStudentProgress}
          />
        )}

        {selectedCourse && (
          <VideoListModal
            visible={videoListVisible}
            course={selectedCourse}
            onClose={() => setVideoListVisible(false)}
          />
        )}

        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
