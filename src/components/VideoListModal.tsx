// src/components/courses/VideoListModal.tsx

import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { CourseView, CourseVideo } from "@/src/types/course.types";
import { themes } from "@/src/context/themes";
import { coursesStyles as styles } from "@/src/styles/coursesScreen"; // ✅ Using shared styles

// ✅ Component Props Interface
interface VideoListModalProps {
  visible: boolean;
  course: CourseView;
  onClose: () => void;
}

const VideoListModal: React.FC<VideoListModalProps> = ({
  visible,
  course,
  onClose,
}) => {
  // ✅ Video Link Handler (Why: Professional external link management)
  const handleOpenVideo = async (video: CourseVideo) => {
    try {
      console.log(`🎥 Opening video: ${video.title}`);

      const supported = await Linking.canOpenURL(video.video_url);

      if (supported) {
        await Linking.openURL(video.video_url);
      } else {
        Alert.alert(
          "Cannot Open Video",
          "Unable to open video. Please check the video URL or your internet connection."
        );
      }
    } catch (error) {
      console.error("Error opening video:", error);
      Alert.alert("Error", "Failed to open video");
    }
  };

  // ✅ Data Processing (Why: Sort videos for logical display)
  const sortedVideos =
    course.videos?.sort((a, b) => a.order_index - b.order_index) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {" "}
        {/* ✅ Shared style */}
        {/* ✅ Modal Header */}
        <View style={styles.modalHeader}>
          {" "}
          {/* ✅ Shared style */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            {" "}
            {/* ✅ Shared style */}
            <FontAwesome name="times" size={24} color={themes.white} />
          </TouchableOpacity>
          <View style={styles.modalTitleSection}>
            {" "}
            {/* ✅ Shared style */}
            <Text style={styles.modalTitle}>{course.title}</Text>{" "}
            {/* ✅ Shared style */}
            <Text style={styles.modalSubtitle}>
              {" "}
              {/* ✅ Shared style */}
              {sortedVideos.length} Video{sortedVideos.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.closeButtonPlaceholder} /> {/* ✅ Shared style */}
        </View>
        {/* ✅ Content Area */}
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {" "}
          {/* ✅ Shared style */}
          {sortedVideos.length === 0 ? (
            // ✅ Empty State (Reusing shared empty state styles)
            <View style={styles.emptyStateModal}>
              {" "}
              {/* ✅ Shared style */}
              <FontAwesome
                name="video-camera"
                size={48}
                color={themes.vegasGold + "60"}
              />
              <Text style={styles.emptyStateTitle}>No Videos Available</Text>{" "}
              {/* ✅ Shared style */}
              <Text style={styles.emptyStateText}>
                {" "}
                {/* ✅ Shared style */}
                No videos have been added to this course yet.
              </Text>
            </View>
          ) : (
            // ✅ Video List (Using shared video item styles)
            sortedVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoItem} // ✅ Shared style
                onPress={() => handleOpenVideo(video)}
                activeOpacity={0.7}
              >
                <View style={styles.videoIcon}>
                  {" "}
                  {/* ✅ Shared style */}
                  <FontAwesome
                    name="play-circle"
                    size={24}
                    color={themes.vegasGold}
                  />
                </View>

                <View style={styles.videoContent}>
                  {" "}
                  {/* ✅ Shared style */}
                  <Text style={styles.videoTitle}>{video.title}</Text>{" "}
                  {/* ✅ Shared style */}
                  {video.description && (
                    <Text style={styles.videoDescription} numberOfLines={2}>
                      {" "}
                      {/* ✅ Shared style */}
                      {video.description}
                    </Text>
                  )}
                  <View style={styles.videoMeta}>
                    {" "}
                    {/* ✅ Shared style */}
                    <Text style={styles.videoOrder}>
                      Video #{video.order_index}
                    </Text>{" "}
                    {video.week_number && (
                      <Text style={styles.videoWeek}>
                        Week {video.week_number}
                      </Text>
                    )}
                  </View>
                </View>

                <FontAwesome
                  name="external-link"
                  size={16}
                  color={themes.white + "80"}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default VideoListModal;
