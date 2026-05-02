import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { themes } from "@/src/context/themes";
import { detailModalStyles as styles } from "@/src/styles/CalendarPageStyles/detailModalStyles";
import { SessionDetailed } from "@/src/types/sessions.types";
import { formatDateString, formatTimeString } from "@/src/utils/dateTimeUtils";
import { drillService } from "@/src/services/courseDrillService";
import { sessionFormService, SessionParticipant } from "@/src/services/sessionFormService";
import { ClassWithDrills } from "@/src/types/course.drills.types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
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
  onCheckIn?: (sessionId: number) => void;
  isCancelling: boolean;
}

export default function SessionDetailsModal({
  visible,
  session,
  onClose,
  onCancel,
  onReviewMaterials,
  onBeginSession,
  onCheckIn,
  isCancelling,
}: SessionDetailsModalProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantClasses, setParticipantClasses] = useState<Array<{
    participant: SessionParticipant & { student_name?: string | null };
    courseId: number;
    weekNumber: number;
    classWithDrills: ClassWithDrills | null;
    loading: boolean;
  }>>([]);

  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const weekNumber = session?.week_number ?? session?.enrollment_current_week ?? null;
  const courseId = session?.course_id ?? null;

  useEffect(() => {
    if (!visible || !session?.id || !isInstructor) {
      setParticipants([]);
      return;
    }
    setParticipantsLoading(true);
    sessionFormService
      .getSessionParticipants(session.id)
      .then((res) => {
        if (res.success && res.data) setParticipants(res.data);
        else setParticipants([]);
      })
      .catch(() => setParticipants([]))
      .finally(() => setParticipantsLoading(false));
  }, [visible, session?.id, isInstructor]);

  useEffect(() => {
    if (!visible || !isInstructor || !session) {
      setParticipantClasses([]);
      return;
    }
    if (participantsLoading) {
      setParticipantClasses([]);
      return;
    }
    const cId = session.course_id ?? null;
    const wNum = session.week_number ?? session.enrollment_current_week ?? null;

    if (participants.length === 0) {
      if (cId != null && wNum != null) {
        setParticipantClasses([{
          participant: { id: 0, session_id: session.id, student_id: 0, enrollment_id: null, student_name: session.student_name ?? "Student", student_email: null, current_week: wNum, enrollment_status: null, booked_week_number: wNum, booked_course_id: cId, booked_course_title: session.course_title },
          courseId: cId,
          weekNumber: wNum,
          classWithDrills: null,
          loading: true,
        }]);
        drillService.getClassByWeek(cId, wNum).then((res) => {
          setParticipantClasses((prev) => prev.map((p) =>
            p.participant.id === 0 && p.courseId === cId && p.weekNumber === wNum
              ? { ...p, classWithDrills: res.success ? res.data ?? null : null, loading: false }
              : p
          ));
        }).catch(() => {
          setParticipantClasses((prev) => prev.map((p) =>
            p.participant.id === 0 ? { ...p, classWithDrills: null, loading: false } : p
          ));
        });
      } else setParticipantClasses([]);
      return;
    }

    const entries = participants.map((p) => ({
      participant: p,
      courseId: p.booked_course_id ?? cId ?? 0,
      weekNumber: p.booked_week_number ?? p.current_week ?? wNum ?? 0,
    })).filter((e) => e.courseId > 0 && e.weekNumber > 0);

    setParticipantClasses(entries.map((e) => ({ ...e, classWithDrills: null, loading: true })));

    entries.forEach((entry, idx) => {
      drillService
        .getClassByWeek(entry.courseId, entry.weekNumber)
        .then((res) => {
          setParticipantClasses((prev) => prev.map((p, i) =>
            i === idx ? { ...p, classWithDrills: res.success ? res.data ?? null : null, loading: false } : p
          ));
        })
        .catch(() => {
          setParticipantClasses((prev) => prev.map((p, i) =>
            i === idx ? { ...p, classWithDrills: null, loading: false } : p
          ));
        });
    });
  }, [visible, isInstructor, session, participants, participantsLoading]);

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
        onPress={() => (onCheckIn ? onCheckIn(session.id) : onReviewMaterials())}
      >
        <Text style={styles.sessionButtonTextPrimary}>
          {onCheckIn ? "Check In" : "Review Materials"}
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

            {isInstructor && (participantClasses.length > 0 || (courseId != null && weekNumber != null && !participantsLoading)) && (
              <View style={[styles.infoCardTertiary, { marginTop: 12 }]}>
                <Text style={[styles.infoLabel, { marginBottom: 8 }]}>Class & drills (session prep)</Text>
                {participantClasses.length === 0 && (courseId == null || weekNumber == null) ? (
                  <Text style={styles.infoValueTertiary}>No course or week for this session.</Text>
                ) : (
                  participantClasses.map((pc, idx) => (
                    <View key={`${pc.participant.student_id}-${pc.courseId}-${pc.weekNumber}-${idx}`} style={{ marginBottom: 16 }}>
                      <Text style={[styles.infoValueSecondary, { marginBottom: 6, color: themes.vegasGold }]}>
                        {pc.participant.student_name || `Student #${pc.participant.student_id}`} — Week {pc.weekNumber}
                      </Text>
                      {pc.loading ? (
                        <View style={{ paddingVertical: 12, alignItems: "center" }}>
                          <ActivityIndicator size="small" color={themes.vegasGold} />
                        </View>
                      ) : pc.classWithDrills ? (
                        <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                          <Text style={[styles.infoValueSecondary, { marginBottom: 4 }]}>
                            {pc.classWithDrills.title || `Week ${pc.classWithDrills.week_index}`}
                          </Text>
                          {pc.classWithDrills.endstate != null && pc.classWithDrills.endstate !== "" && (
                            <Text style={[styles.infoValueTertiary, { marginBottom: 6 }]}>
                              End state: {pc.classWithDrills.endstate}
                            </Text>
                          )}
                          {pc.classWithDrills.round_count != null && (
                            <Text style={[styles.infoValueTertiary, { marginBottom: 8 }]}>
                              Round count: {pc.classWithDrills.round_count}
                            </Text>
                          )}
                          <Text style={[styles.infoLabel, { marginTop: 8, marginBottom: 4 }]}>Drills</Text>
                          {(pc.classWithDrills.class_drills ?? [])
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((cd) => (
                              <View
                                key={cd.id}
                                style={{
                                  padding: 10,
                                  marginBottom: 6,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: themes.vegasGold,
                                  backgroundColor: "rgba(0,0,0,0.3)",
                                }}
                              >
                                <Text style={{ fontFamily: "Chakra-Bold", fontSize: 14, color: themes.white }}>
                                  {cd.drill.name}
                                  {cd.is_homework ? " (Homework)" : ""}
                                  {cd.duration_minutes != null ? ` · ${cd.duration_minutes} min` : ""}
                                </Text>
                                {cd.drill.purpose ? (
                                  <Text style={[styles.infoValueTertiary, { marginTop: 4 }]} numberOfLines={2}>
                                    {cd.drill.purpose}
                                  </Text>
                                ) : null}
                                {(cd.drill.target_spec || cd.drill.target_count) && (
                                  <Text style={[styles.infoValueTertiary, { marginTop: 2, fontSize: 12 }]}>
                                    Target: {[cd.drill.target_spec, cd.drill.target_count != null ? `×${cd.drill.target_count}` : null].filter(Boolean).join(" ")}
                                  </Text>
                                )}
                                {cd.drill.loadout?.trim() ? (
                                  <Text style={[styles.infoValueTertiary, { marginTop: 2, fontSize: 12 }]} numberOfLines={2}>
                                    Loadout/Commands: {cd.drill.loadout}
                                  </Text>
                                ) : null}
                                {cd.drill.instructor_notes ? (
                                  <Text style={[styles.infoValueTertiary, { marginTop: 2, fontSize: 12, fontStyle: "italic" }]} numberOfLines={2}>
                                    Notes: {cd.drill.instructor_notes}
                                  </Text>
                                ) : null}
                              </View>
                            ))}
                        </ScrollView>
                      ) : (
                        <Text style={styles.infoValueTertiary}>No class found for this week.</Text>
                      )}
                    </View>
                  ))
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
