import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { sessionFormStyles as styles } from "@/src/styles/SessionStyles/sessionFormStyles";

import {
  sessionFormService,
  SessionParticipant,
} from "@/src/services/sessionFormService";
import { sessionService } from "@/src/services/sessionService";

import {
  SessionForm,
  CreateSessionFormRequest,
  UpdateSessionFormRequest,
  CompleteSessionFormRequest,
} from "@/src/types/forms.types";
import {
  SleepQuality,
  PreStressLevel,
  PostStressLevel,
} from "@/src/types/enums";
import { SessionDetailed } from "@/src/types/sessions.types";

interface FormState {
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
  advance_student: boolean;
  instructor_notes: string;
}

const DEFAULT_FORM_STATE: FormState = {
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
  advance_student: false,
  instructor_notes: "",
};

function formStateFromApi(form: SessionForm): FormState {
  return {
    sleep_hours: form.sleep_hours ?? null,
    sleep_quality: form.sleep_quality ?? null,
    has_eaten: form.has_eaten ?? null,
    has_pain: form.has_pain ?? null,
    pain_description: form.pain_description ?? "",
    pre_stress_level: form.pre_stress_level ?? null,
    motivation_before: form.motivation_before ?? null,
    post_stress_level: form.post_stress_level ?? null,
    motivation_after: form.motivation_after ?? null,
    confidence_level: form.confidence_level ?? null,
    highlight: form.highlight ?? "",
    advance_student: form.advance_student ?? false,
    instructor_notes: form.instructor_notes ?? "",
  };
}

export default function SessionFormScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId, 10);

  const [session, setSession] = useState<SessionDetailed | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [forms, setForms] = useState<Map<number, SessionForm>>(new Map());
  const [formStates, setFormStates] = useState<Map<number, FormState>>(
    new Map()
  );
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!sessionId || isNaN(sessionId)) {
      setError("Invalid session ID");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [sessionRes, participantsRes, formsRes] = await Promise.all([
        sessionService.getSessionById(sessionId),
        sessionFormService.getSessionParticipants(sessionId),
        sessionFormService.getFormsBySession(sessionId),
      ]);

      if (!sessionRes.success || !sessionRes.data) {
        setError("Failed to load session");
        return;
      }
      setSession(sessionRes.data);

      const loadedParticipants = participantsRes.data || [];
      setParticipants(loadedParticipants);

      const existingForms = formsRes.data || [];
      const formsMap = new Map<number, SessionForm>();
      const statesMap = new Map<number, FormState>();

      for (const form of existingForms) {
        formsMap.set(form.student_id, form);
        statesMap.set(form.student_id, formStateFromApi(form));
      }

      // Initialize empty form states for participants without forms yet
      for (const p of loadedParticipants) {
        if (!statesMap.has(p.student_id)) {
          statesMap.set(p.student_id, { ...DEFAULT_FORM_STATE });
        }
      }

      setForms(formsMap);
      setFormStates(statesMap);

      if (loadedParticipants.length > 0 && !activeStudentId) {
        setActiveStudentId(loadedParticipants[0].student_id);
      }
    } catch (err) {
      setError("Failed to load session data");
      console.error("SessionFormScreen loadData error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeForm = activeStudentId ? forms.get(activeStudentId) : null;
  const activeFormState = activeStudentId
    ? formStates.get(activeStudentId) ?? { ...DEFAULT_FORM_STATE }
    : { ...DEFAULT_FORM_STATE };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    if (!activeStudentId) return;
    setFormStates((prev) => {
      const next = new Map(prev);
      const current = next.get(activeStudentId) ?? { ...DEFAULT_FORM_STATE };
      next.set(activeStudentId, { ...current, [field]: value });
      return next;
    });
  };

  const handleCreateOrSave = async () => {
    if (!activeStudentId) return;
    setIsSaving(true);

    try {
      const existingForm = forms.get(activeStudentId);
      const state = formStates.get(activeStudentId) ?? DEFAULT_FORM_STATE;

      if (existingForm) {
        const updateData: UpdateSessionFormRequest = {};
        if (state.sleep_hours !== null) updateData.sleep_hours = state.sleep_hours;
        if (state.sleep_quality) updateData.sleep_quality = state.sleep_quality;
        if (state.has_eaten !== null) updateData.has_eaten = state.has_eaten;
        if (state.has_pain !== null) updateData.has_pain = state.has_pain;
        if (state.pain_description) updateData.pain_description = state.pain_description;
        if (state.pre_stress_level) updateData.pre_stress_level = state.pre_stress_level;
        if (state.motivation_before !== null) updateData.motivation_before = state.motivation_before;
        if (state.post_stress_level) updateData.post_stress_level = state.post_stress_level;
        if (state.motivation_after !== null) updateData.motivation_after = state.motivation_after;
        if (state.confidence_level !== null) updateData.confidence_level = state.confidence_level;
        if (state.highlight) updateData.highlight = state.highlight;
        if (state.instructor_notes) updateData.instructor_notes = state.instructor_notes;

        const res = await sessionFormService.updateSessionForm(
          existingForm.id,
          updateData
        );
        if (res.success && res.data) {
          setForms((prev) => {
            const next = new Map(prev);
            next.set(activeStudentId, res.data!);
            return next;
          });
        } else {
          Alert.alert("Error", res.error || "Failed to save form");
        }
      } else {
        const createReq: CreateSessionFormRequest = {
          session_id: sessionId,
          student_id: activeStudentId,
        };
        const res = await sessionFormService.createSessionForm(createReq);
        if (res.success && res.data) {
          setForms((prev) => {
            const next = new Map(prev);
            next.set(activeStudentId, res.data!);
            return next;
          });
        } else {
          Alert.alert("Error", res.error || "Failed to create form");
        }
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!activeStudentId) return;
    const existingForm = forms.get(activeStudentId);
    if (!existingForm) {
      Alert.alert("Save First", "Please save the form before completing.");
      return;
    }

    const state = formStates.get(activeStudentId) ?? DEFAULT_FORM_STATE;

    if (state.confidence_level === null) {
      Alert.alert(
        "Required Field",
        "Please set the confidence level before completing."
      );
      return;
    }

    const action = state.advance_student ? "advance to the next week" : "stay on the current week";
    Alert.alert(
      "Complete Form",
      `This will complete the form for this student and ${action}. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setIsCompleting(true);
            try {
              const completeData: CompleteSessionFormRequest = {
                sleep_hours: state.sleep_hours ?? undefined,
                sleep_quality: state.sleep_quality ?? undefined,
                has_eaten: state.has_eaten ?? undefined,
                has_pain: state.has_pain ?? undefined,
                pain_description: state.pain_description || undefined,
                pre_stress_level: state.pre_stress_level ?? undefined,
                motivation_before: state.motivation_before ?? undefined,
                post_stress_level: state.post_stress_level ?? PostStressLevel.SAME,
                motivation_after: state.motivation_after ?? undefined,
                confidence_level: state.confidence_level ?? undefined,
                highlight: state.highlight || undefined,
                advance_student: state.advance_student,
                instructor_notes: state.instructor_notes || undefined,
              };

              const res = await sessionFormService.completeSessionForm(
                existingForm.id,
                completeData
              );

              if (res.success) {
                Alert.alert(
                  "Form Completed",
                  res.student_advanced
                    ? "Student has been advanced to the next week."
                    : "Form saved. Student stays on current week."
                );

                // Refresh forms to get updated state
                const formsRes = await sessionFormService.getFormsBySession(sessionId);
                if (formsRes.success && formsRes.data) {
                  const newFormsMap = new Map<number, SessionForm>();
                  const newStatesMap = new Map<number, FormState>(formStates);
                  for (const form of formsRes.data) {
                    newFormsMap.set(form.student_id, form);
                    newStatesMap.set(form.student_id, formStateFromApi(form));
                  }
                  setForms(newFormsMap);
                  setFormStates(newStatesMap);
                }

                // Check if all forms are complete to auto-navigate back
                if (res.session_completed) {
                  Alert.alert(
                    "Session Complete",
                    "All student forms have been completed. The session is now marked as completed.",
                    [{ text: "OK", onPress: () => router.back() }]
                  );
                }
              } else {
                Alert.alert("Error", res.error || "Failed to complete form");
              }
            } catch (err) {
              Alert.alert("Error", "An unexpected error occurred");
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const renderNumberSelector = (
    value: number | null,
    onChange: (v: number) => void,
    min: number,
    max: number
  ) => {
    const range = [];
    for (let i = min; i <= max; i++) range.push(i);

    return (
      <View style={styles.sliderTrack}>
        {range.map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.sliderSegment,
              value === n && styles.sliderSegmentActive,
            ]}
            onPress={() => onChange(n)}
          >
            <Text
              style={[
                styles.sliderSegmentText,
                value === n && styles.sliderSegmentTextActive,
              ]}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEnumSelector = <T extends string>(
    value: T | null,
    options: { value: T; label: string }[],
    onChange: (v: T) => void
  ) => (
    <View style={styles.toggleRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.toggleButton,
            value === opt.value && styles.toggleButtonActive,
          ]}
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

  const renderBoolSelector = (
    value: boolean | null,
    onChange: (v: boolean) => void
  ) => (
    <View style={styles.boolRow}>
      <TouchableOpacity
        style={[styles.boolButton, value === true && styles.boolButtonActive]}
        onPress={() => onChange(true)}
      >
        <Text
          style={[
            styles.boolButtonText,
            value === true && styles.boolButtonTextActive,
          ]}
        >
          Yes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.boolButton, value === false && styles.boolButtonActive]}
        onPress={() => onChange(false)}
      >
        <Text
          style={[
            styles.boolButtonText,
            value === false && styles.boolButtonTextActive,
          ]}
        >
          No
        </Text>
      </TouchableOpacity>
    </View>
  );

  const isFormCompleted = activeForm?.is_completed === true;
  const formExists = !!activeForm;

  // Render
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

  if (error) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, { marginTop: 12, backgroundColor: "transparent", borderWidth: 1, borderColor: themes.vegasGold }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.retryButtonText, { color: themes.vegasGold }]}>Go Back</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {session?.course_title || session?.title || "Session Form"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {participants.length} student{participants.length !== 1 ? "s" : ""}
                {session?.week_number ? ` · Week ${session.week_number}` : ""}
              </Text>
            </View>
          </View>

          {/* Student Switcher (for group sessions) */}
          {participants.length > 1 && (
            <View style={styles.studentSwitcherContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.studentSwitcherScroll}>
                  {participants.map((p) => {
                    const isActive = p.student_id === activeStudentId;
                    const studentForm = forms.get(p.student_id);
                    const completed = studentForm?.is_completed === true;
                    return (
                      <TouchableOpacity
                        key={p.student_id}
                        style={[
                          styles.studentChip,
                          isActive && styles.studentChipActive,
                        ]}
                        onPress={() => setActiveStudentId(p.student_id)}
                      >
                        <Text
                          style={[
                            styles.studentChipText,
                            isActive && styles.studentChipTextActive,
                          ]}
                        >
                          {p.student_name || `Student ${p.student_id}`}
                        </Text>
                        <Text
                          style={[
                            styles.studentChipStatus,
                            isActive && styles.studentChipStatusActive,
                          ]}
                        >
                          {completed
                            ? "✓ Done"
                            : studentForm
                            ? "In Progress"
                            : "Not Started"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <ScrollView
            style={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Week info */}
            {activeStudentId && (
              <View style={styles.weekInfoBar}>
                <Text style={styles.weekInfoText}>
                  Week{" "}
                  {participants.find((p) => p.student_id === activeStudentId)
                    ?.current_week ?? "—"}
                </Text>
                <Text style={styles.weekInfoSubtext}>
                  {isFormCompleted ? "Completed" : formExists ? "In Progress" : "Not Started"}
                </Text>
              </View>
            )}

            {isFormCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>
                  ✓ Form completed for this student
                </Text>
              </View>
            )}

            {/* PRE-TRAINING SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Pre-Training</Text>

              {/* Sleep Hours */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Hours of Sleep</Text>
                {renderNumberSelector(
                  activeFormState.sleep_hours,
                  (v) => updateField("sleep_hours", v),
                  0,
                  12
                )}
              </View>

              {/* Sleep Quality */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Sleep Quality</Text>
                {renderEnumSelector(
                  activeFormState.sleep_quality,
                  [
                    { value: SleepQuality.POOR, label: "Poor" },
                    { value: SleepQuality.AVERAGE, label: "Average" },
                    { value: SleepQuality.GREAT, label: "Great" },
                  ],
                  (v) => updateField("sleep_quality", v)
                )}
              </View>

              {/* Has Eaten */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Eaten in last 4 hours?</Text>
                {renderBoolSelector(activeFormState.has_eaten, (v) =>
                  updateField("has_eaten", v)
                )}
              </View>

              {/* Pain */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Currently experiencing pain?</Text>
                {renderBoolSelector(activeFormState.has_pain, (v) =>
                  updateField("has_pain", v)
                )}
              </View>

              {activeFormState.has_pain && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Pain Description</Text>
                  <TextInput
                    style={styles.textInput}
                    value={activeFormState.pain_description}
                    onChangeText={(v) => updateField("pain_description", v)}
                    placeholder="Describe the pain..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    editable={!isFormCompleted}
                  />
                </View>
              )}

              {/* Pre Stress Level */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Stress Level</Text>
                {renderEnumSelector(
                  activeFormState.pre_stress_level,
                  [
                    { value: PreStressLevel.LOW, label: "Low" },
                    { value: PreStressLevel.MODERATE, label: "Moderate" },
                    { value: PreStressLevel.HIGH, label: "High" },
                  ],
                  (v) => updateField("pre_stress_level", v)
                )}
              </View>

              {/* Motivation Before */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Motivation (1-10)</Text>
                {renderNumberSelector(
                  activeFormState.motivation_before,
                  (v) => updateField("motivation_before", v),
                  1,
                  10
                )}
              </View>
            </View>

            {/* POST-TRAINING SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Post-Training</Text>

              {/* Post Stress Level */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Post-Session Stress</Text>
                {renderEnumSelector(
                  activeFormState.post_stress_level,
                  [
                    { value: PostStressLevel.LESS_STRESSED, label: "Less Stressed" },
                    { value: PostStressLevel.SAME, label: "Same" },
                    { value: PostStressLevel.MORE_STRESSED, label: "More Stressed" },
                  ],
                  (v) => updateField("post_stress_level", v)
                )}
              </View>

              {/* Motivation After */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Motivation After (1-10)</Text>
                {renderNumberSelector(
                  activeFormState.motivation_after,
                  (v) => updateField("motivation_after", v),
                  1,
                  10
                )}
              </View>

              {/* Confidence Level */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Confidence Level (1-10) *
                </Text>
                {renderNumberSelector(
                  activeFormState.confidence_level,
                  (v) => updateField("confidence_level", v),
                  1,
                  10
                )}
                <Text style={styles.fieldHint}>Required to complete form</Text>
              </View>

              {/* Highlight */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Session Highlight</Text>
                <TextInput
                  style={styles.textInput}
                  value={activeFormState.highlight}
                  onChangeText={(v) => updateField("highlight", v)}
                  placeholder="What was the student most proud of?"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  editable={!isFormCompleted}
                />
              </View>

              {/* Instructor Notes */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Instructor Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline]}
                  value={activeFormState.instructor_notes}
                  onChangeText={(v) => updateField("instructor_notes", v)}
                  placeholder="Notes about this student's session..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  numberOfLines={4}
                  editable={!isFormCompleted}
                />
              </View>
            </View>

            {/* PROGRESS + COMPLETE SECTION */}
            {!isFormCompleted && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Assessment</Text>

                {/* Progress to Next Week Toggle */}
                <TouchableOpacity
                  style={[
                    styles.progressButton,
                    activeFormState.advance_student && styles.progressButtonActive,
                  ]}
                  onPress={() =>
                    updateField("advance_student", !activeFormState.advance_student)
                  }
                >
                  <Text
                    style={[
                      styles.progressButtonText,
                      activeFormState.advance_student && styles.progressButtonTextActive,
                    ]}
                  >
                    {activeFormState.advance_student
                      ? "✓ WILL PROGRESS TO NEXT WEEK"
                      : "PROGRESS TO NEXT WEEK"}
                  </Text>
                  <Text style={styles.progressButtonSubtext}>
                    {activeFormState.advance_student
                      ? "Tap again to cancel advancement"
                      : "Tap to advance student to the next week"}
                  </Text>
                </TouchableOpacity>

                {/* Save Draft */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateOrSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={themes.vegasGold} />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {formExists ? "SAVE DRAFT" : "START FORM"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Complete Form */}
                {formExists && (
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      isCompleting && styles.completeButtonDisabled,
                    ]}
                    onPress={handleComplete}
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <ActivityIndicator size="small" color={themes.black} />
                    ) : (
                      <Text style={styles.completeButtonText}>
                        COMPLETE FORM
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
