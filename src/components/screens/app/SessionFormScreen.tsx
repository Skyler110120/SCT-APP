import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { InAppVideoPlayer } from "@/src/components/InAppVideoPlayer";
import { themes } from "@/src/context/themes";
import { sessionFormStyles as styles } from "@/src/styles/SessionStyles/sessionFormStyles";

import { sessionFormService } from "@/src/services/sessionFormService";
import { sessionService } from "@/src/services/sessionService";
import { testSessionFormService } from "@/src/services/testSessionFormService";
import { drillService } from "@/src/services/courseDrillService";

import {
  SessionParticipantDrillProgress,
  SessionParticipantWorkflow,
} from "@/src/types/forms.types";
import {
  SleepQuality,
  PreStressLevel,
  PostStressLevel,
} from "@/src/types/enums";
import { SessionDetailed } from "@/src/types/sessions.types";
import {
  buildDrillMetricDraft,
  drillMetricKey,
  mergeDrillMetricDrafts,
  type DrillMetricDraft,
} from "@/src/utils/drillMetricDraft";

interface DraftState {
  sleep_hours: number | null;
  sleep_quality: SleepQuality | null;
  has_eaten: boolean | null;
  has_pain: boolean | null;
  pain_description: string;
  pre_stress_level: PreStressLevel | null;
  motivation_before: number | null;
  post_stress_level: PostStressLevel | null;
  motivation_after: number | null;
  confidence_level: number | null;
  highlight: string;
  instructor_notes: string;
  advance_student: boolean;
  final_passed: boolean | null;
  pass_override_reason: string;
}

const EMPTY_DRAFT: DraftState = {
  sleep_hours: null,
  sleep_quality: null,
  has_eaten: null,
  has_pain: null,
  pain_description: "",
  pre_stress_level: null,
  motivation_before: null,
  post_stress_level: null,
  motivation_after: null,
  confidence_level: null,
  highlight: "",
  instructor_notes: "",
  advance_student: false,
  final_passed: null,
  pass_override_reason: "",
};

function toDraft(participant: SessionParticipantWorkflow): DraftState {
  const form = participant.form;
  return {
    sleep_hours: form?.sleep_hours ?? null,
    sleep_quality: (form?.sleep_quality as SleepQuality | undefined) ?? null,
    has_eaten: form?.has_eaten ?? null,
    has_pain: form?.has_pain ?? null,
    pain_description: form?.pain_description ?? "",
    pre_stress_level: (form?.pre_stress_level as PreStressLevel | undefined) ?? null,
    motivation_before: form?.motivation_before ?? null,
    post_stress_level: (form?.post_stress_level as PostStressLevel | undefined) ?? null,
    motivation_after: form?.motivation_after ?? null,
    confidence_level: form?.confidence_level ?? null,
    highlight: form?.highlight ?? "",
    instructor_notes: form?.instructor_notes ?? "",
    final_passed: form?.final_passed ?? form?.auto_passed ?? null,
    advance_student:
      form?.advance_student ?? (form?.final_passed ?? form?.auto_passed ?? false),
    pass_override_reason: form?.pass_override_reason ?? "",
  };
}

function phaseLabel(p: SessionParticipantWorkflow): string {
  if (p.is_session_submitted) return "Completed";
  if (p.current_phase === "PRE_TRAINING") {
    return p.pretraining_status === "COMPLETED" ? "Pre-training done" : "Pre-training";
  }
  if (p.current_phase === "DRILLS") return "Drills";
  if (p.current_phase === "POST_TRAINING") return "Post-training";
  return "Completed";
}

export default function SessionFormScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId, 10);

  const [session, setSession] = useState<SessionDetailed | null>(null);
  const [participants, setParticipants] = useState<SessionParticipantWorkflow[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Map<number, DraftState>>(new Map());
  const [drillMetricDrafts, setDrillMetricDrafts] = useState<Map<string, DrillMetricDraft>>(
    new Map()
  );
  const [showDrillReview, setShowDrillReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyDrillId, setBusyDrillId] = useState<number | null>(null);
  const [loadingVideoId, setLoadingVideoId] = useState<number | null>(null);
  const [playback, setPlayback] = useState<{ url: string; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replaceFromWorkflow = useCallback(
    (workflowParticipants: SessionParticipantWorkflow[]) => {
      setParticipants(workflowParticipants);
      setDrafts((prev) => {
        const next = new Map(prev);
        for (const p of workflowParticipants) {
          next.set(p.student_id, toDraft(p));
        }
        return next;
      });
      setDrillMetricDrafts((prev) => mergeDrillMetricDrafts(prev, workflowParticipants));
    },
    []
  );

  const loadData = useCallback(async () => {
    if (!sessionId || Number.isNaN(sessionId)) {
      setError("Invalid session");
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const [sessionRes, workflowRes] = await Promise.all([
        sessionService.getSessionById(sessionId),
        sessionFormService.getSessionWorkflow(sessionId),
      ]);
      if (!sessionRes.success || !sessionRes.data) {
        setError("Could not load session details");
        return;
      }
      if (!workflowRes.success || !workflowRes.data) {
        setError(workflowRes.error ?? "Could not load session workflow");
        return;
      }
      setSession(sessionRes.data);
      replaceFromWorkflow(workflowRes.data.participants);
      const first = workflowRes.data.participants[0];
      setActiveStudentId((current) => current ?? first?.student_id ?? null);
    } catch {
      setError("Failed to load session workflow");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, replaceFromWorkflow]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setShowDrillReview(false);
  }, [activeStudentId]);

  const activeParticipant = useMemo(
    () => participants.find((p) => p.student_id === activeStudentId) ?? null,
    [participants, activeStudentId]
  );
  const activeDraft = activeStudentId
    ? drafts.get(activeStudentId) ?? EMPTY_DRAFT
    : EMPTY_DRAFT;

  const updateField = <K extends keyof DraftState>(field: K, value: DraftState[K]) => {
    if (!activeStudentId) return;
    setDrafts((prev) => {
      const next = new Map(prev);
      const current = next.get(activeStudentId) ?? EMPTY_DRAFT;
      next.set(activeStudentId, { ...current, [field]: value });
      return next;
    });
  };

  const setFinalOutcome = (value: boolean) => {
    if (!activeStudentId) return;
    setDrafts((prev) => {
      const next = new Map(prev);
      const current = next.get(activeStudentId) ?? EMPTY_DRAFT;
      next.set(activeStudentId, { ...current, final_passed: value, advance_student: value });
      return next;
    });
  };

  const updateDrillMetricField = <K extends keyof DrillMetricDraft>(
    studentId: number,
    drillProgressId: number,
    field: K,
    value: DrillMetricDraft[K]
  ) => {
    const key = drillMetricKey(studentId, drillProgressId);
    setDrillMetricDrafts((prev) => {
      const next = new Map(prev);
      const current =
        next.get(key) ?? { timeSeconds: "", hitCount: "", passOverride: "AUTO" as const };
      next.set(key, { ...current, [field]: value });
      return next;
    });
  };

  const submitPretraining = async () => {
    if (!activeParticipant) return;
    setIsSubmitting(true);
    const res = await sessionFormService.submitPretraining(sessionId, {
      student_id: activeParticipant.student_id,
      sleep_hours: activeDraft.sleep_hours ?? undefined,
      sleep_quality: activeDraft.sleep_quality ?? undefined,
      has_eaten: activeDraft.has_eaten ?? undefined,
      has_pain: activeDraft.has_pain ?? undefined,
      pain_description: activeDraft.pain_description || undefined,
      pre_stress_level: activeDraft.pre_stress_level ?? undefined,
      motivation_before: activeDraft.motivation_before ?? undefined,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      replaceFromWorkflow(res.data.participants);
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to submit pre-training");
  };

  const toggleDrill = async (drillProgressId: number, isCompleted: boolean) => {
    if (!activeParticipant) return;
    setBusyDrillId(drillProgressId);
    const res = await sessionFormService.toggleDrill(sessionId, drillProgressId, {
      student_id: activeParticipant.student_id,
      is_completed: isCompleted,
    });
    setBusyDrillId(null);
    if (res.success && res.data) {
      replaceFromWorkflow(res.data.participants);
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to update drill");
  };

  const saveTestDrillMetrics = async (
    participant: SessionParticipantWorkflow,
    drill: SessionParticipantDrillProgress
  ) => {
    const formId = participant.form?.id;
    if (!formId) {
      Alert.alert("Pre-training required", "Complete pre-training first to start the test form.");
      return;
    }
    const draft = drillMetricDrafts.get(drillMetricKey(participant.student_id, drill.id));
    if (!draft) return;

    const timeSeconds = draft.timeSeconds.trim() === "" ? undefined : Number(draft.timeSeconds);
    const hitCount = draft.hitCount.trim() === "" ? undefined : Number(draft.hitCount);
    if (
      (timeSeconds != null && Number.isNaN(timeSeconds)) ||
      (hitCount != null && Number.isNaN(hitCount))
    ) {
      Alert.alert("Invalid values", "Enter valid numeric values for time and hits.");
      return;
    }

    setBusyDrillId(drill.id);
    const response = await testSessionFormService.updateTestSessionForm(formId, {
      drill_updates: [
        {
          drill_id: drill.drill_id,
          time_seconds: timeSeconds,
          hit_count: hitCount,
          passed: draft.passOverride === "AUTO" ? undefined : draft.passOverride === "PASS",
        },
      ],
    });
    if (!response.success) {
      setBusyDrillId(null);
      Alert.alert("Error", response.error ?? "Failed to save drill metrics");
      return;
    }
    const workflowRes = await sessionFormService.getSessionWorkflow(sessionId);
    setBusyDrillId(null);
    if (workflowRes.success && workflowRes.data) {
      replaceFromWorkflow(workflowRes.data.participants);
      return;
    }
    Alert.alert("Error", workflowRes.error ?? "Saved metrics, but failed to refresh workflow");
  };

  const openDrillVideo = async (
    drill: SessionParticipantDrillProgress,
    video: SessionParticipantDrillProgress["videos"][number]
  ) => {
    setLoadingVideoId(video.id);
    const res = await drillService.getDrillVideoAccessUrl(drill.drill_id, video.id);
    setLoadingVideoId(null);
    if (!res.success || !res.data?.access_url) {
      Alert.alert("Error", res.error ?? "Failed to load video");
      return;
    }
    setPlayback({
      url: res.data.access_url,
      title: video.title || video.video_filename || "Video",
    });
  };

  const endEarly = () => {
    if (!activeParticipant) return;
    Alert.alert(
      "End drills early?",
      "Move this student to post-training without completing all drills?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End early",
          style: "destructive",
          onPress: async () => {
            const res = await sessionFormService.endEarly(sessionId, {
              student_id: activeParticipant.student_id,
              reason: "Instructor override",
            });
            if (res.success && res.data) {
              replaceFromWorkflow(res.data.participants);
              return;
            }
            Alert.alert("Error", res.error ?? "Failed to end early");
          },
        },
      ]
    );
  };

  const startPosttraining = async () => {
    if (!activeParticipant) return;
    if (activeParticipant.current_phase === "POST_TRAINING") {
      setShowDrillReview(false);
      return;
    }
    setIsSubmitting(true);
    const res = await sessionFormService.startPosttraining(sessionId, {
      student_id: activeParticipant.student_id,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      setShowDrillReview(false);
      replaceFromWorkflow(res.data.participants);
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to start post-training");
  };

  const submitPosttraining = async () => {
    if (!activeParticipant) return;
    const isTest = activeParticipant.session_mode === "TEST";
    setIsSubmitting(true);
    const res = await sessionFormService.submitPosttraining(sessionId, {
      student_id: activeParticipant.student_id,
      post_stress_level: activeDraft.post_stress_level ?? undefined,
      motivation_after: activeDraft.motivation_after ?? undefined,
      confidence_level: activeDraft.confidence_level ?? undefined,
      highlight: activeDraft.highlight || undefined,
      instructor_notes: activeDraft.instructor_notes || undefined,
      advance_student: activeDraft.advance_student,
      final_passed: isTest ? activeDraft.final_passed ?? undefined : undefined,
      pass_override_reason: isTest ? activeDraft.pass_override_reason || undefined : undefined,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      replaceFromWorkflow(res.data.participants);
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to submit post-training");
  };

  const submitParticipant = async () => {
    if (!activeParticipant) return;
    setIsSubmitting(true);
    const res = await sessionFormService.submitParticipantSession(sessionId, {
      student_id: activeParticipant.student_id,
    });
    setIsSubmitting(false);
    if (res.success && res.data) {
      replaceFromWorkflow(res.data.participants);
      const remaining = res.data.participants.filter((p) => !p.is_session_submitted);
      if (remaining.length === 0) {
        Alert.alert("Session Complete", "All students submitted. Session complete.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        setActiveStudentId(remaining[0].student_id);
      }
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to submit student session");
  };

  const renderNumberSelector = (
    value: number | null,
    onChange: (v: number) => void,
    min: number,
    max: number
  ) => (
    <View style={styles.sliderTrack}>
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <TouchableOpacity
          key={n}
          style={[styles.sliderSegment, value === n && styles.sliderSegmentActive]}
          onPress={() => onChange(n)}
        >
          <Text style={[styles.sliderSegmentText, value === n && styles.sliderSegmentTextActive]}>
            {n}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEnumSelector = <T extends string>(
    value: T | null,
    options: { value: T; label: string }[],
    onChange: (v: T) => void
  ) => (
    <View style={styles.toggleRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.toggleButton, value === opt.value && styles.toggleButtonActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            style={[
              styles.toggleButtonText,
              value === opt.value && styles.toggleButtonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBoolSelector = (value: boolean | null, onChange: (v: boolean) => void) => (
    <View style={styles.boolRow}>
      {[true, false].map((option) => (
        <TouchableOpacity
          key={String(option)}
          style={[styles.boolButton, value === option && styles.boolButtonActive]}
          onPress={() => onChange(option)}
        >
          <Text style={[styles.boolButtonText, value === option && styles.boolButtonTextActive]}>
            {option ? "Yes" : "No"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPrimaryButton = (label: string, onPress: () => void, disabled = false) => (
    <TouchableOpacity
      style={[styles.completeButton, disabled && styles.completeButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color={themes.black} />
      ) : (
        <Text style={styles.completeButtonText} numberOfLines={1}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themes.vegasGold} />
            <Text style={styles.loadingText}>Loading session...</Text>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  if (error || !activeParticipant) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>{error ?? "No participants in this session."}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.retryButton,
                {
                  marginTop: 12,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: themes.vegasGold,
                },
              ]}
              onPress={() => router.back()}
            >
              <Text style={[styles.retryButtonText, { color: themes.vegasGold }]}>Go Back</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  const isTest = activeParticipant.session_mode === "TEST";
  const isRetrainFree = activeParticipant.session_mode === "RETRAIN_FREE";
  const completedDrills = activeParticipant.drills.filter((d) => d.is_completed).length;
  const totalDrills = activeParticipant.drills.length;
  const drillsComplete = totalDrills === 0 || completedDrills === totalDrills;
  const canProceedToPosttraining =
    drillsComplete || activeParticipant.current_phase === "POST_TRAINING";
  const showDrillsSection = activeParticipant.current_phase === "DRILLS" || showDrillReview;
  const showPosttrainingSection =
    activeParticipant.current_phase === "POST_TRAINING" && !showDrillReview;
  const canUseBackToDrills =
    activeParticipant.current_phase === "POST_TRAINING" &&
    activeParticipant.posttraining_status !== "COMPLETED" &&
    !showDrillReview &&
    !activeParticipant.is_session_submitted;
  const sortedDrills = [...activeParticipant.drills].sort(
    (a, b) => a.display_order - b.display_order
  );

  const handleHeaderBack = () => {
    if (canUseBackToDrills) {
      setShowDrillReview(true);
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleHeaderBack}>
              <Text style={styles.backButtonText}>
                {canUseBackToDrills ? "← Drills" : "← Exit"}
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {session?.course_title || session?.title || "Conduct Session"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {participants.length} student{participants.length !== 1 ? "s" : ""} in session
              </Text>
            </View>
          </View>

          {participants.length > 1 && (
            <View style={styles.studentSwitcherContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.studentSwitcherScroll}>
                  {participants.map((p) => {
                    const isActive = p.student_id === activeStudentId;
                    return (
                      <TouchableOpacity
                        key={p.student_id}
                        style={[styles.studentChip, isActive && styles.studentChipActive]}
                        onPress={() => setActiveStudentId(p.student_id)}
                      >
                        <Text
                          style={[styles.studentChipText, isActive && styles.studentChipTextActive]}
                        >
                          {p.student_name || `Student ${p.student_id}`}
                          {p.is_test_session_required ? " (Test)" : ""}
                        </Text>
                        <Text
                          style={[
                            styles.studentChipStatus,
                            isActive && styles.studentChipStatusActive,
                          ]}
                        >
                          {phaseLabel(p)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.weekInfoBar}>
              <Text style={styles.weekInfoText}>
                {participants.length === 1 ? `${activeParticipant.student_name} · ` : ""}
                Week {activeParticipant.booked_week_number ?? "—"}
              </Text>
              <Text style={styles.weekInfoSubtext}>
                {phaseLabel(activeParticipant)}
                {activeParticipant.is_test_session_required ? " · Test session" : ""}
              </Text>
            </View>

            {activeParticipant.current_phase === "PRE_TRAINING" && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Pre-Training Check-In</Text>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Hours of Sleep</Text>
                  {renderNumberSelector(
                    activeDraft.sleep_hours,
                    (v) => updateField("sleep_hours", v),
                    0,
                    12
                  )}
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Sleep Quality</Text>
                  {renderEnumSelector(
                    activeDraft.sleep_quality,
                    [
                      { value: SleepQuality.POOR, label: "Poor" },
                      { value: SleepQuality.AVERAGE, label: "Average" },
                      { value: SleepQuality.GREAT, label: "Great" },
                    ],
                    (v) => updateField("sleep_quality", v)
                  )}
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Eaten in last 4 hours?</Text>
                  {renderBoolSelector(activeDraft.has_eaten, (v) => updateField("has_eaten", v))}
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Currently in pain?</Text>
                  {renderBoolSelector(activeDraft.has_pain, (v) => updateField("has_pain", v))}
                </View>
                {activeDraft.has_pain && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Pain Description</Text>
                    <TextInput
                      style={styles.textInput}
                      value={activeDraft.pain_description}
                      onChangeText={(v) => updateField("pain_description", v)}
                      placeholder="Describe the pain..."
                      placeholderTextColor="rgba(237,235,227,0.3)"
                    />
                  </View>
                )}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Stress Level</Text>
                  {renderEnumSelector(
                    activeDraft.pre_stress_level,
                    [
                      { value: PreStressLevel.LOW, label: "Low" },
                      { value: PreStressLevel.MODERATE, label: "Moderate" },
                      { value: PreStressLevel.HIGH, label: "High" },
                    ],
                    (v) => updateField("pre_stress_level", v)
                  )}
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Motivation Before (1-10)</Text>
                  {renderNumberSelector(
                    activeDraft.motivation_before,
                    (v) => updateField("motivation_before", v),
                    1,
                    10
                  )}
                </View>
                {renderPrimaryButton("Complete pre-training", submitPretraining, isSubmitting)}
              </View>
            )}

            {showDrillsSection && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  {isRetrainFree ? "Retraining Session" : "Drills"}
                </Text>
                <Text style={styles.fieldHint}>
                  {isRetrainFree
                    ? "No assigned drills in this retraining session. Use this time to coach targeted fundamentals, then continue to post-training."
                    : `${completedDrills} / ${totalDrills} complete${
                        drillsComplete ? " — Ready to end session." : ""
                      }`}
                </Text>

                {sortedDrills.map((drill) => {
                  const metricDraft =
                    drillMetricDrafts.get(drillMetricKey(activeParticipant.student_id, drill.id)) ??
                    buildDrillMetricDraft(drill);
                  const busy = busyDrillId === drill.id;
                  const target = [
                    drill.target_spec,
                    drill.target_count ? `×${drill.target_count}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const rounds = [
                    drill.rounds_total,
                    drill.rounds_per_string ? `(${drill.rounds_per_string}/string)` : null,
                  ]
                    .filter((v) => v != null && v !== "")
                    .join(" ");
                  return (
                    <View
                      key={drill.id}
                      style={[styles.drillCard, drill.is_completed && styles.drillCardComplete]}
                    >
                      <TouchableOpacity
                        style={styles.drillHeader}
                        onPress={() => toggleDrill(drill.id, !drill.is_completed)}
                        disabled={busy}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: drill.is_completed }}
                      >
                        <View
                          style={[styles.drillCheckbox, drill.is_completed && styles.drillCheckboxChecked]}
                        >
                          {busy ? (
                            <ActivityIndicator size="small" color={themes.vegasGold} />
                          ) : drill.is_completed ? (
                            <Text style={styles.drillCheckmark}>✓</Text>
                          ) : null}
                        </View>
                        <Text style={styles.drillName}>
                          {drill.display_order}. {drill.name}
                        </Text>
                      </TouchableOpacity>

                      {drill.purpose ? <Text style={styles.drillMeta}>{drill.purpose}</Text> : null}
                      {target ? <Text style={styles.drillMeta}>Target: {target}</Text> : null}
                      {rounds ? <Text style={styles.drillMeta}>Rounds: {rounds}</Text> : null}
                      {drill.loadout?.trim() ? (
                        <Text style={styles.drillMeta}>Loadout/Commands: {drill.loadout}</Text>
                      ) : null}
                      {drill.instructor_notes?.trim() ? (
                        <Text style={[styles.drillMeta, { fontStyle: "italic" }]}>
                          Notes: {drill.instructor_notes}
                        </Text>
                      ) : null}

                      {drill.videos.length > 0 && (
                        <View style={styles.drillVideoRow}>
                          {drill.videos.map((video) => (
                            <TouchableOpacity
                              key={video.id}
                              style={styles.drillVideoLink}
                              onPress={() => openDrillVideo(drill, video)}
                              disabled={loadingVideoId === video.id}
                            >
                              {loadingVideoId === video.id ? (
                                <ActivityIndicator size="small" color={themes.vegasGold} />
                              ) : (
                                <Text style={styles.drillVideoLinkText}>
                                  ▶ {video.title || video.video_filename || "Video"}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {isTest && (
                        <View style={{ marginTop: 12 }}>
                          <Text style={styles.fieldLabel}>Performance</Text>
                          <Text style={styles.drillMeta}>
                            Auto result:{" "}
                            {drill.auto_passed == null
                              ? "Pending metrics"
                              : drill.auto_passed
                              ? "Pass"
                              : "Fail"}
                          </Text>
                          <View style={[styles.toggleRow, { marginTop: 8 }]}>
                            <TextInput
                              style={[styles.textInput, { flex: 1 }]}
                              value={metricDraft.timeSeconds}
                              onChangeText={(v) =>
                                updateDrillMetricField(activeParticipant.student_id, drill.id, "timeSeconds", v)
                              }
                              placeholder="Time (sec)"
                              placeholderTextColor="rgba(237,235,227,0.3)"
                              keyboardType="decimal-pad"
                            />
                            <TextInput
                              style={[styles.textInput, { flex: 1 }]}
                              value={metricDraft.hitCount}
                              onChangeText={(v) =>
                                updateDrillMetricField(activeParticipant.student_id, drill.id, "hitCount", v)
                              }
                              placeholder="Hits"
                              placeholderTextColor="rgba(237,235,227,0.3)"
                              keyboardType="number-pad"
                            />
                          </View>
                          <View style={[styles.toggleRow, { marginTop: 8 }]}>
                            {(
                              [
                                { value: "AUTO", label: "Use auto" },
                                { value: "PASS", label: "Pass" },
                                { value: "FAIL", label: "Fail" },
                              ] as const
                            ).map((opt) => (
                              <TouchableOpacity
                                key={opt.value}
                                style={[
                                  styles.toggleButton,
                                  metricDraft.passOverride === opt.value && styles.toggleButtonActive,
                                ]}
                                onPress={() =>
                                  updateDrillMetricField(
                                    activeParticipant.student_id,
                                    drill.id,
                                    "passOverride",
                                    opt.value
                                  )
                                }
                              >
                                <Text
                                  style={[
                                    styles.toggleButtonText,
                                    metricDraft.passOverride === opt.value &&
                                      styles.toggleButtonTextActive,
                                  ]}
                                >
                                  {opt.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => saveTestDrillMetrics(activeParticipant, drill)}
                            disabled={busy}
                          >
                            <Text style={styles.saveButtonText}>SAVE METRICS</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                {!canProceedToPosttraining && !isRetrainFree && (
                  <TouchableOpacity style={styles.saveButton} onPress={endEarly}>
                    <Text style={styles.saveButtonText} numberOfLines={1}>
                      Move to post-training
                    </Text>
                  </TouchableOpacity>
                )}
                {canProceedToPosttraining &&
                  renderPrimaryButton(
                    activeParticipant.current_phase === "POST_TRAINING"
                      ? "Back to post-training"
                      : "End session",
                    startPosttraining,
                    isSubmitting
                  )}
              </View>
            )}

            {showPosttrainingSection && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Post-Training</Text>
                {!activeParticipant.is_session_submitted &&
                  activeParticipant.posttraining_status !== "COMPLETED" && (
                    <>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Post-Session Stress</Text>
                        {renderEnumSelector(
                          activeDraft.post_stress_level,
                          [
                            { value: PostStressLevel.LESS_STRESSED, label: "Less" },
                            { value: PostStressLevel.SAME, label: "Same" },
                            { value: PostStressLevel.MORE_STRESSED, label: "More" },
                          ],
                          (v) => updateField("post_stress_level", v)
                        )}
                      </View>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Motivation After (1-10)</Text>
                        {renderNumberSelector(
                          activeDraft.motivation_after,
                          (v) => updateField("motivation_after", v),
                          1,
                          10
                        )}
                      </View>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Confidence Level (1-10)</Text>
                        {renderNumberSelector(
                          activeDraft.confidence_level,
                          (v) => updateField("confidence_level", v),
                          1,
                          10
                        )}
                      </View>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Highlight</Text>
                        <TextInput
                          style={styles.textInput}
                          value={activeDraft.highlight}
                          onChangeText={(v) => updateField("highlight", v)}
                          placeholder="What was the student most proud of?"
                          placeholderTextColor="rgba(237,235,227,0.3)"
                        />
                      </View>
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Instructor Notes</Text>
                        <TextInput
                          style={[styles.textInput, styles.textInputMultiline]}
                          value={activeDraft.instructor_notes}
                          onChangeText={(v) => updateField("instructor_notes", v)}
                          placeholder="Notes about this student's session..."
                          placeholderTextColor="rgba(237,235,227,0.3)"
                          multiline
                          numberOfLines={4}
                        />
                      </View>

                      {isTest && (
                        <>
                          <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Recommended Outcome</Text>
                            <Text style={styles.fieldHint}>
                              {activeParticipant.form?.auto_passed == null
                                ? "Enter drill metrics to compute pass/fail."
                                : activeParticipant.form.auto_passed
                                ? "Auto result: Pass"
                                : "Auto result: Fail"}
                            </Text>
                          </View>
                          <View style={[styles.toggleRow, styles.fieldContainer]}>
                            <TouchableOpacity
                              style={[
                                styles.toggleButton,
                                activeDraft.final_passed === true && styles.toggleButtonActive,
                              ]}
                              onPress={() => setFinalOutcome(true)}
                            >
                              <Text
                                style={[
                                  styles.toggleButtonText,
                                  activeDraft.final_passed === true && styles.toggleButtonTextActive,
                                ]}
                              >
                                Confirm Pass
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.toggleButton,
                                activeDraft.final_passed === false && styles.toggleButtonActive,
                              ]}
                              onPress={() => setFinalOutcome(false)}
                            >
                              <Text
                                style={[
                                  styles.toggleButtonText,
                                  activeDraft.final_passed === false &&
                                    styles.toggleButtonTextActive,
                                ]}
                              >
                                Confirm Fail
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Override Note (optional)</Text>
                            <TextInput
                              style={styles.textInput}
                              value={activeDraft.pass_override_reason}
                              onChangeText={(v) => updateField("pass_override_reason", v)}
                              placeholder="Why outcome differs from auto result"
                              placeholderTextColor="rgba(237,235,227,0.3)"
                            />
                          </View>
                        </>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.progressButton,
                          activeDraft.advance_student && styles.progressButtonActive,
                        ]}
                        onPress={() => updateField("advance_student", !activeDraft.advance_student)}
                      >
                        <Text
                          style={[
                            styles.progressButtonText,
                            activeDraft.advance_student && styles.progressButtonTextActive,
                          ]}
                        >
                          {activeDraft.advance_student
                            ? "✓ WILL PROGRESS TO NEXT WEEK"
                            : "PROGRESS TO NEXT WEEK"}
                        </Text>
                        <Text style={styles.progressButtonSubtext}>
                          {activeDraft.advance_student
                            ? "Tap again to cancel advancement"
                            : "Tap to advance student to the next week"}
                        </Text>
                      </TouchableOpacity>

                      {renderPrimaryButton(
                        "Complete post-training",
                        submitPosttraining,
                        isSubmitting
                      )}
                    </>
                  )}

                {activeParticipant.posttraining_status === "COMPLETED" &&
                  !activeParticipant.is_session_submitted &&
                  renderPrimaryButton("Submit student session", submitParticipant, isSubmitting)}

                {activeParticipant.is_session_submitted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Student session submitted</Text>
                  </View>
                )}
              </View>
            )}

            {activeParticipant.current_phase === "COMPLETED" && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>
                  ✓ Student complete for this session
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
      <InAppVideoPlayer
        visible={playback != null}
        url={playback?.url ?? null}
        title={playback?.title}
        onClose={() => setPlayback(null)}
      />
    </View>
  );
}
