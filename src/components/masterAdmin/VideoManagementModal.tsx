import { themes } from "@/src/context/themes";
import { masterAdminManageCourses as styles } from "@/src/styles/CoursePageStyles/masterAdminManageCourses";
import { CourseAdminView, CourseVideo } from "@/src/types/course.types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

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

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: "80%" }]}>
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
              style={{ padding: 8, borderWidth: 1, borderColor: themes.white}}
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
            {course.videos.length === 0 ? (
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
              <FlatList
                data={course.videos.sort(
                  (a, b) => a.order_index - b.order_index
                )}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
                Videos are displayed to students in order. You can assign videos to specific weeks (1-24) or leave unassigned for general viewing
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
