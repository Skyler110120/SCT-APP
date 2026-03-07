import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";
import { detailModalStyles as styles } from "@/src/styles/CalendarPageStyles/detailModalStyles";
import { SessionDetailed } from "@/src/types/sessions.types";
import { formatDateString, formatTimeString } from "@/src/utils/dateTimeUtils";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface SessionDetailsModalProps {
  visible: boolean;
  session: SessionDetailed | null;
  onClose: () => void;
  onCancel: (sessionId: number) => void;
  onReviewMaterials: () => void;
  onBeginSession?: (sessionId: number) => void;
  isCancelling: boolean;
}

export default function SessionDetailsModal({
  visible,
  session,
  onClose,
  onCancel,
  onReviewMaterials,
  onBeginSession,
  isCancelling,
}: SessionDetailsModalProps) {
  const { user } = useAuth();

  const handleCancel = () => {
    if (!session) return;
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this training session? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => onCancel(session.id),
        },
      ]
    );
  };

  if (!session) return null;

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const canBeCancelled = session.can_be_cancelled;
  const canBeStarted = session.can_be_completed && isInstructor;

  const getStatusColor = (status: string) => {
    if (status === "scheduled" || status === "SCHEDULED") {
      return themes.vegasGold;
    } else if (status === "completed" || status === "COMPLETED") {
      return "#4CAF50"; // Green
    } else if (status === "cancelled" || status === "CANCELLED") {
      return "#FF4444"; // Red
    } else {
      return "#666";
    }
  };
  const renderStudentActions = () => (
    <View style={styles.columnLayout}>
      <TouchableOpacity
        style={styles.sessionButtonPrimary}
        onPress={onReviewMaterials}
      >
        <Text style={styles.sessionButtonTextPrimary}>Review Materials</Text>
      </TouchableOpacity>

      <View style={styles.rowLayout}>
        {canBeCancelled && (
          <TouchableOpacity
            style={styles.sessionButtonDestructive}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color={themes.white} size="small" />
            ) : (
              <Text style={styles.sessionButtonTextDestructive}>Cancel</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.sessionButtonClose}
          onPress={onClose}
          disabled={isCancelling}
        >
          <Text style={styles.sessionButtonTextSecondary}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInstructorActions = () => (
    <View style={styles.columnLayout}>
      
        <TouchableOpacity
          style={styles.sessionButtonPrimary}
          onPress={() => onBeginSession && onBeginSession(session.id)}
        >
          <Text style={styles.sessionButtonTextPrimary}>Begin Session</Text>
        </TouchableOpacity>
      

      <TouchableOpacity
        style={
          canBeStarted
            ? styles.sessionButtonSecondary
            : styles.sessionButtonPrimary
        }
        onPress={onReviewMaterials}
      >
        <Text
          style={
            canBeStarted
              ? styles.sessionButtonTextSecondary
              : styles.sessionButtonTextPrimary
          }
        >
          Review Materials
        </Text>
      </TouchableOpacity>
      <View style={styles.rowLayout}>
        {canBeCancelled && (
          <TouchableOpacity
            style={styles.sessionButtonDestructive}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color={themes.white} size="small" />
            ) : (
              <Text style={styles.sessionButtonTextDestructive}>Cancel</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.sessionButtonClose}
          onPress={onClose}
          disabled={isCancelling}
        >
          <Text style={styles.sessionButtonTextSecondary}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={styles.sessionModalContent}>
          <View style={styles.spacingMedium}>
            <Text style={styles.sessionModalTitle}>{session.course_title || session.title}</Text>
          </View>

          <View style={styles.sessionModalBody}>
            <View style={styles.infoCard}>
              <View style={styles.rowLayout}>
                <View style={styles.flexEqual}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValuePrimary}>
                    {formatDateString(session.start_time)}
                  </Text>
                </View>

                <View style={styles.flexEqual}>
                  <Text style={[styles.infoLabel, { textAlign: "center" }]}>
                    Time
                  </Text>
                  <Text
                    style={[styles.infoValuePrimary, { textAlign: "center" }]}
                  >
                    {formatTimeString(session.start_time)} -{" "}
                    {formatTimeString(session.end_time)}
                  </Text>
                </View>

                <View style={styles.flexEqual}>
                  <Text style={[styles.infoLabel, { textAlign: "right" }]}>
                    Duration
                  </Text>
                  <Text
                    style={[styles.infoValuePrimary, { textAlign: "right" }]}
                  >
                    {session.duration_minutes
                      ? `${Math.floor(session.duration_minutes / 60)} hr ${
                          session.duration_minutes % 60
                        } min`
                      : "1h"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.rowLayout, styles.spacingMedium]}>
              <View style={[styles.infoCardSecondary, styles.flexDouble]}>
                <Text style={styles.infoLabel}>
                  {isInstructor ? "Student" : "Instructor"}
                </Text>
                <Text style={styles.infoValueSecondary}>
                  {isInstructor ? session.student_name : session.instructor_name}
                </Text>
                <Text style={styles.infoValueSubtle}>
                  {isInstructor ? session.student_email : session.instructor_email}
                </Text>
              </View>

              <View style={[styles.infoCardSecondary, styles.flexEqual, { alignItems: "center", justifyContent: "center" }]}>
                <Text style={[styles.infoLabel, { textAlign: "center", marginBottom: 8 }]}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {session.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {(session.course_description || session.enrollment_progress_display) && (
              <View style={styles.infoCardTertiary}>
                {session.course_description && (
                  <View style={session.enrollment_progress_display ? styles.spacingMedium : undefined}>
                    <Text style={styles.infoLabel}>Course Description</Text>
                    <Text style={styles.infoValueTertiary}>
                      {session.course_description}
                    </Text>
                  </View>
                )}

                {session.enrollment_progress_display && (
                  <View>
                    <Text style={styles.infoLabel}>Progress {session.enrollment_progress_display}
                      {session.enrollment_progress_percentage && 
                        ` (${session.enrollment_progress_percentage}%)`}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {isInstructor ? renderInstructorActions() : renderStudentActions()}
        </View>
      </View>
    </Modal>
  );
}
