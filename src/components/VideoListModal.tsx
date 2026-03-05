import { themes } from "@/src/context/themes";
import { videoListModalStyles as styles } from "@/src/styles/CoursePageStyles/videoListModalStyles";
import { CourseVideo, CourseView } from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { materialService } from "@/src/services/materialService";

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
  const [loadingVideoId, setLoadingVideoId] = useState<number | null>(null);

  const handleOpenVideo = async (video: CourseVideo) => {
    try {
      console.log(`🎥 Opening video: ${video.title}`);

      let urlToOpen: string;
      if (video.video_s3_key?.trim()) {
        setLoadingVideoId(video.id);
        const res = await materialService.getVideoAccess(course.id, video.id);
        setLoadingVideoId(null);
        if (!res.success || !res.data?.access_url) {
          Alert.alert("Error", res.error || "Failed to get video access");
          return;
        }
        urlToOpen = res.data.access_url;
      } else if (video.video_url?.trim()) {
        urlToOpen = video.video_url;
      } else {
        Alert.alert("Error", "This video has no URL or file.");
        return;
      }

      const supported = await Linking.canOpenURL(urlToOpen);
      if (supported) {
        await Linking.openURL(urlToOpen);
      } else {
        Alert.alert(
          "Cannot Open Video",
          "Unable to open video. Please check the video URL or your internet connection."
        );
      }
    } catch (error) {
      setLoadingVideoId(null);
      console.error("Error opening video:", error);
      Alert.alert("Error", "Failed to open video");
    }
  };

  const sortedVideos =
    course.videos?.sort((a, b) => a.order_index - b.order_index) || [];

  const isInstructorView = course.viewType === "instructor";
  const studentVideos = isInstructorView
    ? sortedVideos.filter((v) => v.is_public)
    : sortedVideos;
  const instructorOnlyVideos = isInstructorView
    ? sortedVideos.filter((v) => !v.is_public)
    : [];

  const renderVideoList = (videos: CourseVideo[], sectionLabel?: string) => (
    <>
      {sectionLabel && (
        <Text
          style={[
            styles.modalSubtitle,
            {
              marginTop: sectionLabel ? 16 : 0,
              marginBottom: 8,
              fontSize: 13,
              opacity: 0.9,
            },
          ]}
        >
          {sectionLabel}
        </Text>
      )}
      {videos.map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoItem}
          onPress={() => handleOpenVideo(video)}
          activeOpacity={0.7}
          disabled={loadingVideoId === video.id}
        >
          <View style={styles.videoIcon}>
            {loadingVideoId === video.id ? (
              <ActivityIndicator size="small" color={themes.vegasGold} />
            ) : (
              <FontAwesome
                name="play-circle"
                size={24}
                color={themes.vegasGold}
              />
            )}
          </View>

          <View style={styles.videoContent}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            {video.description && (
              <Text style={styles.videoDescription} numberOfLines={2}>
                {video.description}
              </Text>
            )}
            <View style={styles.videoMeta}>
              <Text style={styles.videoOrder}>
                Video #{video.order_index}
              </Text>
              {video.week_number && (
                <Text style={styles.videoWeek}>
                  Week {video.week_number}
                </Text>
              )}
              {isInstructorView && (
                <Text
                  style={[
                    styles.videoWeek,
                    {
                      marginLeft: 8,
                      color: video.is_public ? themes.vegasGold : themes.white + "99",
                    },
                  ]}
                >
                  {video.is_public ? "Student" : "Instructor only"}
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
      ))}
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color={themes.white} />
          </TouchableOpacity>
          <View style={styles.modalTitleSection}>
            <Text style={styles.modalTitle}>{course.title}</Text>
            <Text style={styles.modalSubtitle}>
              {sortedVideos.length} Video{sortedVideos.length !== 1 ? "s" : ""}
              {isInstructorView &&
                instructorOnlyVideos.length > 0 &&
                ` (${studentVideos.length} student, ${instructorOnlyVideos.length} instructor-only)`}
            </Text>
          </View>
          <View style={styles.closeButtonPlaceholder} />
        </View>
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedVideos.length === 0 ? (
            <View style={styles.emptyStateModal}>
              <FontAwesome
                name="video-camera"
                size={48}
                color={themes.vegasGold + "60"}
              />
              <Text style={styles.emptyStateTitle}>No Videos Available</Text>
              <Text style={styles.emptyStateText}>
                No videos have been added to this course yet.
              </Text>
            </View>
          ) : isInstructorView && (studentVideos.length > 0 || instructorOnlyVideos.length > 0) ? (
            <>
              {studentVideos.length > 0 &&
                renderVideoList(
                  studentVideos,
                  "Videos visible to students"
                )}
              {instructorOnlyVideos.length > 0 &&
                renderVideoList(
                  instructorOnlyVideos,
                  "Instructor-only videos"
                )}
            </>
          ) : (
            renderVideoList(sortedVideos)
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default VideoListModal;
