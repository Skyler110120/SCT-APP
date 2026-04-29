import { themes } from "@/src/context/themes";
import { videoManagementModalStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/videoMangementModalStyles";
import { CourseAdminView, CourseVideo } from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface VideoManagementModalProps {
  visible: boolean;
  course: CourseAdminView;
  onClose: () => void;
  onCreateVideo: () => void;
  onEditVideo: (video: CourseVideo) => void;
  onDeleteVideo: (video: CourseVideo) => void;
}

export default function VideoManagementModal({
  visible,
  course,
  onClose,
  onCreateVideo,
  onEditVideo,
  onDeleteVideo,
}: VideoManagementModalProps) {
  const sortedVideos = [...(course.videos || [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const studentVideos = sortedVideos.filter((v) => v.is_public);
  const instructorOnlyVideos = sortedVideos.filter((v) => !v.is_public);

  const renderVideoItem = ({ item: video }: { item: CourseVideo }) => {
    return (
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{video.title}</Text>
          <Text style={styles.description}>
            {video.description || "No description"}
          </Text>

          <View style={styles.details}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Order: {video.order_index}</Text>
            </View>

            {video.week_number && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Week {video.week_number}</Text>
              </View>
            )}

            <View
              style={[
                styles.badge,
                { backgroundColor: video.is_public ? "#2a5a2a" : "#5a3a2a" },
              ]}
            >
              <Text style={styles.badgeText}>
                {video.is_public ? "Student" : "Instructor only"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEditVideo(video)}
            activeOpacity={0.7}
          >
            <FontAwesome name="edit" size={16} color={themes.vegasGold} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDeleteVideo(video)}
            activeOpacity={0.7}
          >
            <FontAwesome name="trash" size={16} color="#FF4444" />
            <Text style={[styles.actionText, styles.removeText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSection = (
    title: string,
    subtitle: string,
    data: CourseVideo[]
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.modalTitle, { fontSize: 16, marginBottom: 4 }]}>
        {title}
      </Text>
      <Text style={[styles.inputDescription, { marginBottom: 8 }]}>{subtitle}</Text>
      {data.length === 0 ? (
        <Text style={[styles.inputDescription, { fontStyle: "italic" }]}>
          None
        </Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Manage Videos</Text>
              <Text style={styles.inputDescription}>
                {course.title} - {course.videos.length} video
                {course.videos.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.exitButton}
              activeOpacity={0.7}
            >
              <FontAwesome name="times" size={24} color={themes.vegasGold} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                marginBottom: 20,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              },
            ]}
            onPress={onCreateVideo}
            activeOpacity={0.7}
          >
            <FontAwesome
              name="plus"
              size={20}
              color={themes.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Add New Video</Text>
          </TouchableOpacity>

          <View style={[styles.tableContainer, { flex: 1 }]}>
            {sortedVideos.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <FontAwesome
                  name="video-camera"
                  size={48}
                  color={themes.vegasGold}
                />
                <Text style={styles.emptyStateTitle}>No Videos Yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Add your first video to get started with course content.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {renderSection(
                  "Student materials (visible to students)",
                  "Videos marked public. Enrolled students can view these.",
                  studentVideos
                )}
                {renderSection(
                  "Instructor-only materials",
                  "Videos not visible to students. Only instructors and admins can view these.",
                  instructorOnlyVideos
                )}
              </ScrollView>
            )}
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Toggle the visible-to-students option when adding or editing a video to control who can see it. Students only see public videos; instructors and admins see all.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
