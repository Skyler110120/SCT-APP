import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { useAuth } from "@/src/context/AuthContext";
import { courseService } from "@/src/services/courseService";
import { masterAdminManageCourses as styles } from "@/src/styles/CoursePageStyles/masterAdminManageCourses";
import {
  CourseAdminView,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseVideo,
  VideoCreateRequest,
  VideoUpdateRequest,
} from "@/src/types/course.types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CourseForm from "@/src/components/masterAdmin/CourseForm";
import CourseList from "@/src/components/masterAdmin/CourseList";
import DrillManagement from "@/src/components/masterAdmin/DrillManagement";
import VideoForm from "@/src/components/masterAdmin/VideoForm";
import VideoManagementModal from "@/src/components/masterAdmin/VideoManagementModal";
import { themes } from "@/src/context/themes";

export default function MasterAdminCourseManagement() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseAdminView[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseAdminView | null>(
    null
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState<boolean>(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState<boolean>(false);
  const [courseModalVisible, setCourseModalVisible] = useState<boolean>(false);
  const [drillManagementModalVisible, setDrillManagementModalVisible] = useState<boolean>(false);
  const [videoModalVisible, setVideoModalVisible] = useState<boolean>(false);
  const [videoManagementModalVisible, setVideoManagementModalVisible] =
    useState<boolean>(false);

  const [editingCourse, setEditingCourse] = useState<CourseAdminView | null>(
    null
  );
  const [editingVideo, setEditingVideo] = useState<CourseVideo | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseService.getCoursesForAdmin();

      if (response.success && response.data) {
        setCourses(response.data);

        if (response.data.length > 0 && !selectedCourse) {
          setSelectedCourse(response.data[0]);
        }
      } else {
        setError(response.error || "Failed to fetch courses");
        Alert.alert("Error", response.error || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("An unexpected error occurred. Please try again");
      Alert.alert("Error", "An unexpected error occurred. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: CourseAdminView) => {
    console.log("Selected course:", course.title);
    setSelectedCourse(course);
  };

  const handleManageDrillsPress = () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course first");
      return;
    }
    console.log(`Opening drill management for course: ${selectedCourse.title}`)
    setDrillManagementModalVisible(true);
  }

  const handleCreateCourse = async (data: CourseCreateRequest) => {
    setIsSubmittingCourse(true);

    try {
      const response = await courseService.createCourse(data);

      if (response.success && response.data) {
        const updatedCourses = [...courses, response.data];
        setCourses(updatedCourses);
        setSelectedCourse(response.data);
        setCourseModalVisible(false);

        Alert.alert(
          "Success",
          `Course "${response.data.title}" created successfully`
        );
      } else {
        Alert.alert("Error", response.error || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleUpdateCourse = async (data: CourseUpdateRequest) => {
    if (!editingCourse) return;

    setIsSubmittingCourse(true);
    try {
      const response = await courseService.updateCourse(editingCourse.id, data);

      if (response.success && response.data) {
        const updatedCourses = courses.map((course) =>
          course.id == editingCourse.id ? response.data! : course
        );
        setCourses(updatedCourses);

        if (selectedCourse?.id === editingCourse.id) {
          setSelectedCourse(response.data);
        }

        setCourseModalVisible(false);
        setEditingCourse(null);

        Alert.alert(
          "Success",
          `Course "${response.data.title}" updated successfully`
        );
      } else {
        Alert.alert("Error", response.error || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (course: CourseAdminView) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"?\n\nThis action cannot be undone and will remove all associated videos.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDeleteCourse(course.id),
        },
      ]
    );
  };

  const performDeleteCourse = async (courseId: number) => {
    try {
      const response = await courseService.deleteCourse(courseId);

      if (response.success) {
        const updatedCourses = courses.filter(
          (course) => course.id !== courseId
        );
        setCourses(updatedCourses);

        if (selectedCourse?.id === courseId) {
          setSelectedCourse(
            updatedCourses.length > 0 ? updatedCourses[0] : null
          );
        }

        Alert.alert("Success", "Course deleted successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleCreateVideo = async (data: VideoCreateRequest) => {
    if (!selectedCourse) return;

    setIsSubmittingVideo(true);

    try {
      const response = await courseService.addVideoToCourse(
        selectedCourse.id,
        data
      );

      if (response.success && response.data) {
        const updatedCourse = {
          ...selectedCourse,
          videos: [...selectedCourse.videos, response.data],
        };

        const updatedCourses = courses.map((course) =>
          course.id === selectedCourse.id ? updatedCourse : course
        );

        setCourses(updatedCourses);
        setSelectedCourse(updatedCourse);
        setVideoModalVisible(false);

        Alert.alert(
          "Success",
          `Video "${response.data.title}" added successfully`
        );
      } else {
        Alert.alert("Error", response.error || "Failed to add video");
      }
    } catch (error) {
      console.error("Error creating video:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleUpdateVideo = async (data: VideoUpdateRequest) => {
    if (!editingVideo || !selectedCourse) return;

    setIsSubmittingVideo(true);

    try {
      const response = await courseService.updateVideo(editingVideo.id, data);

      if (response.success && response.data) {
        const updatedCourse = {
          ...selectedCourse,
          videos: selectedCourse.videos.map((video) =>
            video.id === editingVideo.id ? response.data! : video
          ),
        };

        const updatedCourses = courses.map((course) =>
          course.id === selectedCourse.id ? updatedCourse : course
        );

        setCourses(updatedCourses);
        setSelectedCourse(updatedCourse);
        setVideoModalVisible(false);
        setEditingVideo(null);

        Alert.alert(
          "Success",
          `Video "${response.data.title}" updated successfully`
        );
      } else {
        Alert.alert("Error", response.error || "Failed to update video");
      }
    } catch (error) {
      console.error("Error updating video:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = (video: CourseVideo) => {
    Alert.alert(
      "Delete Video",
      `Are you sure you want to delete "${video.title}"?\n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDeleteVideo(video.id),
        },
      ]
    );
  };

  const performDeleteVideo = async (videoId: number) => {
    if (!selectedCourse) return;

    try {
      const response = await courseService.removeVideo(videoId);

      if (response.success) {
        const updatedCourse = {
          ...selectedCourse,
          videos: selectedCourse.videos.filter((video) => video.id !== videoId),
        };

        const updatedCourses = courses.map((course) =>
          course.id === selectedCourse.id ? updatedCourse : course
        );

        setCourses(updatedCourses);
        setSelectedCourse(updatedCourse);

        Alert.alert("Success", "Video deleted successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleRetryFetch = () => {
    fetchCourses();
  };

  const handleCreateCoursePress = () => {
    setEditingCourse(null);
    setCourseModalVisible(true);
  };

  const handleEditCoursePress = (course: CourseAdminView) => {
    setEditingCourse(course);
    setCourseModalVisible(true);
  };

  const handleManageVideosPress = () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course first");
      return;
    }
    setVideoManagementModalVisible(true);
  };

  const handleCreateVideoPress = () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course first");
      return;
    }

    setEditingVideo(null);
    setVideoModalVisible(true);
  };

  const handleEditVideoPress = (video: CourseVideo) => {
    setEditingVideo(video);
    setVideoModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.pageTitle}>Course Management</Text>
            {isLoading && courses.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themes.vegasGold} />
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
              <View style={styles.courseSection}>
                <CourseList
                  courses={courses}
                  selectedCourse={selectedCourse}
                  onSelectCourse={handleSelectCourse}
                  onEditCourse={handleEditCoursePress}
                  onDeleteCourse={handleDeleteCourse}
                  isLoading={isLoading}
                />
              </View>
            )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateCoursePress}
            >
              <Text style={styles.buttonText}>Create Course</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !selectedCourse && { opacity: 0.5 }]}
              onPress={handleManageVideosPress}
              disabled={!selectedCourse}
            >
              <Text style={styles.buttonText}>Manage Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !selectedCourse && { opacity: 0.5}]}
              onPress={handleManageDrillsPress}
              disabled={!selectedCourse}
            >
              <Text style={styles.buttonText}>Manage Drills</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <CourseForm
          visible={courseModalVisible}
          course={editingCourse}
          isSubmitting={isSubmittingCourse}
          onClose={() => {
            setCourseModalVisible(false);
            setEditingCourse(null);
          }}
          onCreateCourse={editingCourse ? undefined : handleCreateCourse}
          onUpdateCourse={editingCourse ? handleUpdateCourse : undefined}
        />

        {selectedCourse && (
          <VideoManagementModal
            visible={videoManagementModalVisible}
            course={selectedCourse}
            onClose={() => setVideoManagementModalVisible(false)}
            onCreateVideo={handleCreateVideoPress}
            onEditVideo={handleEditVideoPress}
            onDeleteVideo={handleDeleteVideo}
          />
        )}

        {selectedCourse && (
          <VideoForm
            visible={videoModalVisible}
            video={editingVideo}
            course={selectedCourse}
            isSubmitting={isSubmittingVideo}
            onClose={() => {
              setVideoModalVisible(false);
              setEditingVideo(null);
            }}
            onCreateVideo={editingVideo ? undefined : handleCreateVideo}
            onUpdateVideo={editingVideo ? handleUpdateVideo : undefined}
          />
        )}

        {selectedCourse && (
          <DrillManagement
            visible={drillManagementModalVisible}
            course={selectedCourse}
            onClose={() => setDrillManagementModalVisible(false)}
          />
        )}
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
